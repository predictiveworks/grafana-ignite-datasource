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

import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Button, LegacyForms, TextArea } from '@grafana/ui';

import { IgniteDataSourceOptions, IgniteSecureJsonData } from '../../types';

/**
 * Form Field
 */
const { SecretFormField, FormField, Switch } = LegacyForms;

/**
 * Editor Property
 */
interface Props extends DataSourcePluginOptionsEditorProps<IgniteDataSourceOptions> {}

/**
 * State
 */
interface State {}

/*
 * The current implementation of the configuration options
 * enables to provide a list of Apache Ignite endpoints,
 * decide to leverage partition awareness, user authentication
 * and transport layer security.
 */
export class ConfigEditor extends PureComponent<Props, State> {
  /**
   * Password Secure field (only sent to the backend) for Ignite
   *
   * @param {ChangeEvent<HTMLInputElement>} event Event
   */
  onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({ ...options, secureJsonData: { ...options.secureJsonData, password: event.target.value } });
  };

  /**
   * Password Reset for Apache Ignite
   *
   * In order to enable the user to reset the password,
   * this property must be set to false in the secureJsonFields.
   */
  onResetPassword = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        password: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        password: '',
      },
    });
  };
  /**
   * TLS Client key
   *
   * @param {ChangeEvent<HTMLTextAreaElement>} event Event
   */
  onTlsClientKeyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: { ...options.secureJsonData, tlsClientKey: event.currentTarget.value },
    });
  };

  /**
   * TLS Client Key Reset
   */
  onResetTlsClientKey = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, tlsClientKey: false },
      secureJsonData: { ...options.secureJsonData, tlsClientKey: '' },
    });
  };
  /**
   * TLS Client Certificate
   *
   * @param {ChangeEvent<HTMLTextAreaElement>} event Event
   */
  onTlsClientCertificateChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: { ...options.secureJsonData, tlsClientCert: event.currentTarget.value },
    });
  };

  /**
   * TLS Client Certificate Reset
   */
  onResetTlsClientCertificate = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, tlsClientCert: false },
      secureJsonData: { ...options.secureJsonData, tlsClientCert: '' },
    });
  };

  /**
   * TLS Certification Authority
   *
   * @param {ChangeEvent<HTMLTextAreaElement>} event Event
   */
  onTlsCACertificateChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: { ...options.secureJsonData, tlsCACert: event.currentTarget.value },
    });
  };

  /**
   * TLS CA Certificate Reset
   */
  onResetTlsCACertificate = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: { ...options.secureJsonFields, tlsCACert: false },
      secureJsonData: { ...options.secureJsonData, tlsCACert: '' },
    });
  };

  render() {
    const { options, onOptionsChange } = this.props;
    const { url, jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as IgniteSecureJsonData;

    return (
      <div className="gf-form-group">
        <h3 className="page-heading">Apache Ignite Connection</h3>
        {/*
          The Apache Ignite datasource plugin leverages the REST API.
          */}
        <div className="gf-form">
          <FormField
            label="Endpoint"
            labelWidth={10}
            inputWidth={20}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onOptionsChange({ ...options, url: event.target.value });
            }}
            value={url || ''}
            tooltip="Accepts an URI to the REST endpoint of Apache Ignite."
            placeholder="http://localhost:8080"
          />
        </div>

        <div className="gf-form">
          <Switch
            label="Partition Awareness"
            labelClass="width-10"
            tooltip="Partition awareness allows to send query requests directly to the node that owns the queried data."
            checked={jsonData.partitionAwareness || false}
            onChange={(event) => {
              const jsonData = { ...options.jsonData, partitionAwareness: event.currentTarget.checked };
              onOptionsChange({ ...options, jsonData });
            }}
          />
        </div>

        <br />
        <h3 className="page-heading">User Authentication</h3>

        <div className="gf-form">
          <Switch
            label="Auth Enabled"
            labelClass="width-10"
            tooltip="Allows connections to be limited to specific users."
            checked={jsonData.userAuth || false}
            onChange={(event) => {
              const jsonData = { ...options.jsonData, userAuth: event.currentTarget.checked };
              onOptionsChange({ ...options, jsonData });
            }}
          />

          {jsonData.userAuth && (
            <FormField
              label="Username"
              labelWidth={10}
              inputWidth={10}
              value={jsonData.user}
              tooltip="Provide user name to authenticate."
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                onOptionsChange({ ...options, jsonData: { ...options.jsonData, user: event.target.value } });
              }}
            />
          )}

          {jsonData.userAuth && (
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.password) as boolean}
              value={secureJsonData.password || ''}
              label="Password"
              placeholder="User password"
              labelWidth={10}
              inputWidth={20}
              tooltip="When user authentication is selected, this password will be used to authenticate the specified user."
              onReset={this.onResetPassword}
              onChange={this.onPasswordChange}
            />
          )}
        </div>

        <br />
        {/* 
          TLS support for Apache Ignite requires the provisioning
          of 3 file system paths, i.e. to the file that contains
          the private key, client certificate and the CA certificate. 
          */}
        <h3 className="page-heading">TLS Details</h3>
        {/* A Grafana inline form renders the respective elements in a single line */}
        <div className="gf-form-inline">
          <Switch
            label="TLS Support"
            labelClass="width-10"
            checked={jsonData.tlsAuth || false}
            onChange={(event) => {
              const jsonData = { ...options.jsonData, tlsAuth: event.currentTarget.checked };
              onOptionsChange({ ...options, jsonData });
            }}
          />

          {jsonData.tlsAuth && (
            <Switch
              label="Skip Validation"
              labelClass="width-10"
              tooltip="If checked, the server's certificate will not be checked for validity."
              checked={jsonData.tlsSkipVerify || false}
              onChange={(event) => {
                const jsonData = { ...options.jsonData, tlsSkipVerify: event.currentTarget.checked };
                onOptionsChange({ ...options, jsonData });
              }}
            />
          )}
        </div>

        {jsonData.tlsAuth && (
          <>
            <div className="gf-form-inline">
              <div className="gf-form gf-form--v-stretch">
                <label className="gf-form-label width-10">Client Key</label>
              </div>
              <div className="gf-form gf-form--grow">
                {secureJsonFields && secureJsonFields.tlsClientKey ? (
                  <Button type="reset" variant="secondary" onClick={this.onResetTlsClientKey}>
                    Reset
                  </Button>
                ) : (
                  <TextArea
                    css=""
                    rows={7}
                    className="gf-form-input gf-form-textarea"
                    placeholder="Begins with -----BEGIN PRIVATE KEY-----"
                    onChange={this.onTlsClientKeyChange}
                  />
                )}
              </div>
            </div>
            <div className="gf-form-inline">
              <div className="gf-form gf-form--v-stretch">
                <label className="gf-form-label width-10">Client Certificate</label>
              </div>

              {secureJsonFields && secureJsonFields.tlsClientCert ? (
                <Button type="reset" variant="secondary" onClick={this.onResetTlsClientCertificate}>
                  Reset
                </Button>
              ) : (
                <div className="gf-form gf-form--grow">
                  <TextArea
                    css=""
                    rows={7}
                    className="gf-form-input gf-form-textarea"
                    placeholder="Begins with -----BEGIN CERTIFICATE-----"
                    onChange={this.onTlsClientCertificateChange}
                  />
                </div>
              )}
            </div>
            <div className="gf-form-inline">
              <div className="gf-form gf-form--v-stretch">
                <label className="gf-form-label width-10">Certification Authority</label>
              </div>
              {secureJsonFields && secureJsonFields.tlsCACert ? (
                <Button type="reset" variant="secondary" onClick={this.onResetTlsCACertificate}>
                  Reset
                </Button>
              ) : (
                <div className="gf-form gf-form--grow">
                  <TextArea
                    css=""
                    rows={7}
                    className="gf-form-input gf-form-textarea"
                    placeholder="Begins with -----BEGIN CERTIFICATE-----"
                    onChange={this.onTlsCACertificateChange}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}
