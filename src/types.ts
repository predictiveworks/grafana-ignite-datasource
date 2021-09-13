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
import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

/**
 * Format Type Values
 *
 * The defined values are compliant with Grafana's
 * specification
 */
export enum FormatTypeValue {
  TIMESERIES = 'time_series',
  TABLE = 'table',
}
/**
 * Format Type
 */
export const FormatType: Array<SelectableValue<FormatTypeValue>> = [
  {
    label: 'Time series',
    description: 'The query result describes a time series.',
    value: FormatTypeValue.TIMESERIES,
  },
  {
    label: 'Table',
    description: 'The query result specifies a table.',
    value: FormatTypeValue.TABLE,
  },
];
/**
 * Options configured for each DataSource instance
 */
export interface IgniteDataSourceOptions extends DataSourceJsonData {
  /**
   * Partition Awareness
   *
   * Partition awareness allows the client to send query requests directly
   * to the node that owns the queried data. Without partition awareness,
   * an application that is connected to the cluster via a thin client executes
   * all queries and operations via a single server node that acts as a proxy
   * for the incoming requests.
   *
   * These operations are then re-routed to the node that stores the data that
   * is being requested. This results in a bottleneck that could prevent the
   * application from scaling linearly.
   *
   * @type {boolean}
   */
  partitionAwareness: boolean;
  /**
   * User Authentication
   *
   * @type {boolean}
   */
  userAuth: boolean;
  /**
   * Username
   *
   * @type {string}
   */
  user: string;
  /**
   * TLS Authentication
   *
   * Enable TLS authentication using client
   * certificate configured in secure json data.
   *
   * @type {boolean}
   */
  tlsAuth: boolean;
  /**
   * TLS Skip Verify
   *
   * Controls whether a client verifies the server’s
   * certificate chain and host name.
   *
   * @type {boolean}
   */
  tlsSkipVerify: boolean;
}

export interface IgniteQuery extends DataQuery {
  /**
   * Cache name
   *
   * @type {string}
   */
  cacheName?: string;
  /**
   * Format
   *
   * @type {string}
   */
  format: FormatTypeValue;
  /*
   * Time column
   *
   * @type {string}
   */
  timeColumn?: string;
  /**
   * Query
   *
   * @type {string}
   */
  query?: string;
}
/**
 * Sensitive information, such as passwords, tokens and API keys, are
 * stored by using `secureJsonData` mechanism.
 *
 * Whenever the user saves the data source configuration, the secrets
 * in secureJsonData are sent to the Grafana server and encrypted before
 * they’re stored.
 *
 * Once the secure configuration has been encrypted, it can no longer
 * be accessed from the browser. The only way to access secrets after
 * they’ve been saved is by using the data source proxy.
 */
export interface IgniteSecureJsonData {
  /**
   * Database password
   *
   * @type {string}
   */
  password?: string;
  /**
   * TLS Client Certificate
   *
   * @type {string}
   */
  tlsClientCert?: string;
  /**
   * TLS Client Key
   *
   * @type {string}
   */
  tlsClientKey?: string;
  /**
   * TLS Authority Certificate
   *
   * @type {string}
   */
  tlsCACert?: string;
}
