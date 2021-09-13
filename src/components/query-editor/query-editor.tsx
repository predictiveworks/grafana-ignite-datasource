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
import React, { ChangeEvent, PureComponent } from 'react';
import { css } from 'emotion';

import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { InlineFormLabel, LegacyForms, Select, TextArea } from '@grafana/ui';

import { DataSource } from '../../data-source';
import { FormatTypeValue, FormatType, IgniteDataSourceOptions, IgniteQuery } from '../../types';

/**
 * Form Field
 */
const { FormField } = LegacyForms;

/**
 * Editor Property
 */
type Props = QueryEditorProps<DataSource, IgniteQuery, IgniteDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  /**
   * Change handler for select field
   *
   * @param {ChangeEvent<HTMLInputElement>} event Event
   */
  createSelectFieldHandler<ValueType>(name: keyof IgniteQuery) {
    return (val: SelectableValue<ValueType>) => {
      this.props.onChange({ ...this.props.query, [name]: val.value });
    };
  }

  /**
   * Change handler for textarea field
   *
   * @param {ChangeEvent<HTMLInputElement>} event Event
   */
  createTextareaFieldHandler = (name: keyof IgniteQuery) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange({ ...this.props.query, [name]: event.target.value });
  };

  /**
   * Change handler for text field
   *
   * @param {ChangeEvent<HTMLInputElement>} event Event
   */
  createTextFieldHandler = (name: keyof IgniteQuery) => (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onChange({ ...this.props.query, [name]: event.target.value });
  };

  /**
   * Cache name change
   */
  onCacheNameChange = this.createTextFieldHandler('cacheName');

  /**
   * Format change
   */
  onFormatChange = this.createSelectFieldHandler('format');

  /**
   * Time column change
   */
  onTimeColumnChange = this.createTextFieldHandler('timeColumn');
  /**
   * Query change
   */
  onQueryChange = this.createTextareaFieldHandler('query');

  render() {
    const { cacheName, format, timeColumn, query } = this.props.query;
    return (
      <div className="gf-form-group">
        {/* Provide the name of cache */}
        <div className="gf-form">
          <FormField
            labelWidth={8}
            inputWidth={20}
            value={cacheName}
            onChange={this.onCacheNameChange}
            label="Cache"
            tooltip="Name of the data cache."
          />
        </div>
        {/* Provide the rendering format of the query result */}
        <div className="gf-form">
          <InlineFormLabel tooltip="" width={8}>
            Format
          </InlineFormLabel>
          <Select
            className={css`
              margin-right: 5px;
            `}
            width={40}
            options={FormatType}
            menuPlacement="bottom"
            value={format}
            onChange={this.onFormatChange}
          />
        </div>

        {format === FormatTypeValue.TIMESERIES && (
          <div className="gf-form">
            <FormField
              labelWidth={8}
              inputWidth={20}
              value={timeColumn}
              onChange={this.onTimeColumnChange}
              label="Time column"
              tooltip="Name of the time column."
            />
          </div>
        )}

        <div className="gf-form">
          <InlineFormLabel
            tooltip="The syntax is based on ANSI SQL: https://ignite.apache.org/docs/latest/SQL/sql-introduction"
            width={8}
          >
            SQL Query
          </InlineFormLabel>
          <TextArea css="" value={query} className="gf-form-input" onChange={this.onQueryChange} />
        </div>
      </div>
    );
  }
}
