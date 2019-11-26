/**
 * Copyright (C) 2019 Yudha Tama Aditiyara
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const http2 = require('http2');
const config = require('./config');
const {Server} = require('../../');

/**
 * @+
 */
module.exports = {
  createServer(){
    return new Server(config.server)
  },
  createServerDefaultPort(){
    return new Server(config.serverDefaultPort)
  },
  createHttp2Request(options){
    return new Promise((resolve) => {
      let buffer = '';
      let headers = {};
      let session = http2.connect(this._buildHttp2RequestAuthority('http', options));
      let request = session.request(this._buildHttp2RequestHeaders(options));
      request.setEncoding('utf8');
      request.on('response', (_headers) => headers = _headers);
      request.on('data', (string) => buffer += string);
      request.on('end', () => {
        resolve({buffer, headers, request, session});
        session.destroy();
      });
    });
  },
  createHttp2SecureRequest(options){
    return new Promise((resolve) => {
      let buffer = '';
      let headers = {};
      let session = http2.connect(this._buildHttp2RequestAuthority('https', options), {rejectUnauthorized: false});
      let request = session.request(this._buildHttp2RequestHeaders(options));
      request.setEncoding('utf8');
      request.on('response', (_headers) => headers = _headers);
      request.on('data', (string) => buffer += string);
      request.on('end', () => {
        resolve({buffer, headers, request, session});
        session.destroy();
      });
    });
  },
  _buildHttp2RequestHeaders(options){
    let path = options.path || '/';
    return Object.assign({':path': path}, options.headers);
  },
  _buildHttp2RequestAuthority(scheme, options){
    let url = scheme + '://';
    if (options.host != null) {
      url += options.host;
      if (options.port != null) {
        url += ':' + options.port;
      }
    }
    return url;
  }
};