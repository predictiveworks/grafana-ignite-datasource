/*
 * Copyright (c) 2019 - 2021 Dr. Krusche & Partner PartG. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * @author Stefan Krusche, Dr. Krusche & Partner PartG
 *
 */
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';

import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { FormatTypeValue, IgniteDataSourceOptions, IgniteQuery } from '../types';
/**
 * The current implementation is intended to serve
 * as a show case of how to access Apache Ignite's
 * REST API from Grafana.
 *
 * Prepared, but not implemented yet:
 *
 * Support for user authentication and TLS. Parameters
 * `password` and TLS specific attributes are configured
 * to be stored as encrypted secure data.
 *
 * Access to these attribute values (if specified) must be
 * implemented. The same holds for access token support.
 */
export class DataSource extends DataSourceApi<IgniteQuery, IgniteDataSourceOptions> {
  jsonData: any;
  /*
   * The Apache Ignite query page size by default is 1024;
   * this can be increased to retrieve from result rows.
   */
  PAGE_SIZE = 1024;
  /**
   * Constructor
   *
   * @param {DataSourceInstanceSettings<IgniteDataSourceOptions>} instanceSettings Instance Settings
   */
  constructor(private instanceSettings: DataSourceInstanceSettings<IgniteDataSourceOptions>) {
    super(instanceSettings);
    this.jsonData = this.instanceSettings.jsonData;
  }

  async query(request: DataQueryRequest<IgniteQuery>): Promise<DataQueryResponse> {
    /*
     * STEP #1: Check whether valid request targets exist,
     * i.e. those with a properly defined cache name, and
     * in case of time series requests, those with a specified
     * time column.
     */
    const targets = cloneDeep(request.targets);
    let filtered = targets.filter((t) => {
      if (t.cacheName === undefined || t.cacheName === '') {
        return false;
      } else {
        return true;
      }
    });
    /*
     * Check time column
     */
    filtered = filtered.filter((t) => {
      const format = t.format;
      if (format === undefined) {
        return false;
      }
      if (format === FormatTypeValue.TIMESERIES) {
        if (t.timeColumn === undefined || t.timeColumn === '') {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
    /*
     * Check query
     */
    filtered = filtered.filter((t) => {
      if (t.query === undefined || t.query === '') {
        return false;
      } else {
        return true;
      }
    });

    if (filtered.length === 0) {
      throw 'Please check your query configuration. No valid query targets found.';
    } else {
      /*
       * STEP #2: Check whether the provided caches exists;
       * this is achieved by requesting Apache Ignite REST
       * API to check existence.
       */
      const caches = filtered.map((t) => {
        return t.cacheName;
      });
      /*
       * Combine all individual cache get requests
       */
      const response = await Promise.all(
        caches.map((c) => {
          const requestUrl = '/ignite?cmd=size&cacheName=' + c;
          return this._get(requestUrl, { hideFromInspector: false }).toPromise();
        })
      );
      const errors = response.filter((r) => {
        return r.successStatus !== 0 || r.error !== '';
      });
      if (errors.length !== 0) {
        throw 'At least one of the provided caches does not exist.';
      } else {
        /*
         * STEP #3: All specified caches exist and the Apache Ignite REST API
         * can be called to compute the query results.
         */
        const promises = filtered.map((t) => {
          /*
           * Build core request url and use the predefined
           * page size to determine the number of results.
           */
          let requestUrl = '/ignite?cmd=qryfldexe&cacheName=' + t.cacheName + '&pageSize=' + this.PAGE_SIZE;
          /*
           * Append encoded SQL query: Using URI encoding encodes
           * a white as `%20` while Apache Ignite requires `+`.
           */
          const query = encodeURIComponent(t.query || '').replace('%20', '+');
          requestUrl = requestUrl + '&qry=' + query;

          this._get(requestUrl, { hideFromInspector: false })
            .toPromise()
            .then((result) => {
              /*
               * Check whether the result has errors;
               * in this, the fields are set empty
               */
              if (result.successStatus !== 0 || result.error !== '') {
                const frame = new MutableDataFrame({
                  refId: t.refId,
                  fields: [],
                });

                return frame;
              } else {
                /*
                 * This is a valid query response: the metadata
                 * are used to specify the fields of the Grafana
                 * dataframe
                 */
                const metadata = result.response.fieldsMetadata;
                const frame = new MutableDataFrame({
                  refId: t.refId,
                  fields: this.getFields(metadata),
                });
                const rows = result.response.items;
                rows.forEach((row: any[]) => {
                  frame.appendRow(row);
                });

                return frame;
              }
            });
        });

        return Promise.all(promises).then((data) => ({ data }));
      }
    }
  }
  /*
   * A helper method to extract the field name
   * and type from the metadata provided with
   * the response
   */
  getFields(metadata: any[]): any[] {
    /*
     * Example:
     *
     * "fieldsMetadata": [
     * {
     * "fieldName": "FIRSTNAME",
     * "fieldTypeName": "java.lang.String",
     * "schemaName": "person",
     * "typeName": "PERSON"
     * },
     * {
     * "fieldName": "LASTNAME",
     * "fieldTypeName": "java.lang.String",
     * "schemaName": "person",
     * "typeName": "PERSON"
     * }
     * ],
     *
     * For more information: https://ignite.apache.org/docs/latest/restapi#sql-fields-query-execute
     */
    return metadata.map((field) => {
      const fieldName = field.fieldName;

      let fieldType;
      switch (field.fieldTypeName) {
        case 'java.lang.Boolean': {
          fieldType = FieldType.boolean;
          break;
        }
        case 'java.lang.Byte': {
          fieldType = FieldType.number;
          break;
        }
        case 'java.lang.Double': {
          fieldType = FieldType.number;
          break;
        }
        case 'java.lang.Float': {
          fieldType = FieldType.number;
          break;
        }
        case 'java.lang.Integer': {
          fieldType = FieldType.number;
          break;
        }
        case 'java.lang.Long': {
          fieldType = FieldType.number;
          break;
        }
        case 'java.lang.Short': {
          fieldType = FieldType.number;
          break;
        }
        case 'java.lang.String': {
          fieldType = FieldType.string;
          break;
        }
        case 'java.sql.Date': {
          /*
           * The current mapping interprets a `Date`
           * value as `string`:
           *
           * Example: 2018-01-01
           */
          fieldType = FieldType.string;
          break;
        }
        case 'java.sql.Time': {
          /*
           * The current mapping interprets a `Time`
           * value as `string`:
           *
           * Example: 01:01:01
           */
          fieldType = FieldType.string;
          break;
        }
        case 'java.sql.Timestamp': {
          /*
           * The current mapping interprets a `Timestamp`
           * value as `string`:
           *
           * Example: 2018-02-18%2001:01:01
           */
          fieldType = FieldType.string;
          break;
        }
        case 'java.lang.UUID': {
          fieldType = FieldType.string;
          break;
        }
        case 'org.apache.ignite.lang.IgniteUuid': {
          fieldType = FieldType.string;
          break;
        }
        default:
          fieldType = FieldType.string;
      }

      return {
        name: fieldName,
        type: fieldType,
      };
    });
  }
  /**
   * This method supports Grafana's connection test and
   * retrieves the version of Apache Ignite.
   */
  async testDatasource() {
    try {
      const requestUrl = '/ignite?cmd=version';
      /*
       * Determine whether user authentication is enabled;
       * if this is the case, the request url is extended.
       */
      if (this.jsonData.userAuth === true) {
        /*
         * Once the user has saved the configuration for a data source,
         * any secret configuration (password) will no longer be available
         * in the browser.
         *
         * Encrypted secrets can only be accessed on the server. To this end,
         * the Grafana server comes with a proxy that lets you define templates
         * for your requests. They are called proxy routes.
         *
         * Grafana sends the proxy route to the server, decrypts the secrets
         * along with other configuration, and adds them to the request before
         * sending it off.
         */
      }
      const res = await this._get(requestUrl, { hideFromInspector: false }).toPromise();

      const data = res.data;
      if (data.error === null || data.successStatus === 0) {
        return {
          status: 'success',
          message: 'Successfully connected to Apache Ignite.',
        };
      } else {
        throw 'Failed to connect to Apache Ignite.';
      }
    } catch (err) {
      return {
        status: 'failure',
        message: err.message,
      };
    }
  }
  /**
   * A common helper method to manage GET requests
   */
  _get(apiUrl: string, options?: Partial<BackendSrvRequest>): Observable<Record<string, any>> {
    const baseUrl = this.instanceSettings.url;
    const url = `${baseUrl}${apiUrl}`;

    const req = {
      ...options,
      url,
    };
    /*
     * The advantage of getBackendSrv is that it proxies requests
     * through the Grafana server rather making the request from
     * the browser.
     *
     * This is strongly recommended when making authenticated requests
     * to an external API.
     */
    return getBackendSrv().fetch<Record<string, any>>(req);
  }
}
