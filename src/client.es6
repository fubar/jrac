'use strict';

var url = require('url');
var http = require('http');
var https = require('https');
var querystring = require('querystring');

/**
 * @class RestApiClient
 * @author Philipp Gebauer https://github.com/fubar
 *   With contributions from Joe Gaudet https://github.com/joegaudet
 *
 * A JSON REST API client for Node.js with promises and minimal dependencies.
 *
 * Usage:
 *
 * var booksApi = new RestApiClient('https://www.googleapis.com/books/v1');
 * booksApi
 *   .get('volumes', {q: 'isbn:0307400840'})
 *   .then(result => {
 *     // ...
 *   })
 *   .catch(result => {
 *     // ...
 *   });
 */
class RestApiClient {

  /**
   * @param {string} apiUrl If no schema is included, HTTPS is assumed.
   * @param {boolean} keepConnectionAlive Defaults to false
   */
  constructor (apiUrl, keepConnectionAlive = false) {

    var urlParts = url.parse(apiUrl, true);
    if (!urlParts.protocol) {
      urlParts = url.parse('https://' + apiUrl, true);
    }
    var isHttps = (urlParts.protocol === 'https:');
    this.protocol = urlParts.protocol;
    this.host = urlParts.hostname;
    this.port = urlParts.port || (isHttps ? 443 : 80);
    this.path = urlParts.pathname;
    this.queryStringParams = urlParts.query;

    this.keepConnectionAlive = keepConnectionAlive;
    this.lib = isHttps ? https : http;
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {object} queryStringParams
   * @param {object} requestBodyParams
   * @param {object} headers
   * @returns {Promise} Resolved or rejected with an object that has the following properties and default values:
   *   {
   *     exception: null,
   *     statusCode: null,
   *     headers: null,
   *     bodyStr: null,
   *     bodyObj: {}
   *   }
   *   Values are set as available.
   *
   * @private
   */
  _request (method, path, queryStringParams = {}, requestBodyParams = {}, headers = {}) {

    var body = '';

    headers['Accept'] = 'application/json';
    if (this.keepConnectionAlive) {
      headers['Connection'] = 'keep-alive';
    }
    if (Object.keys(requestBodyParams).length) {
      body = JSON.stringify(requestBodyParams);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = body.length;
    }
    var lib = this.lib;
    var options = {
      protocol: this.protocol,
      hostname: this.host,
      port: this.port,
      method: method,
      path: this._getUri(path, queryStringParams),
      headers: headers
    };
    return new Promise((resolve, reject) => {

      var returnObj = {
        exception: null,
        statusCode: null,
        headers: null,
        bodyStr: null,
        bodyObj: {}
      };

      var request = lib.request(options, response => {

          var chunks = [];

          response
            .on('data', chunk => {
              chunks.push(chunk);
            })
            .on('end', () => {
              returnObj.bodyStr = chunks.join('');
              returnObj.statusCode = response.statusCode;
              returnObj.headers = response.headers;

              if (returnObj.bodyStr.length) {
                try {
                  returnObj.bodyObj = JSON.parse(returnObj.bodyStr);
                } catch (e) {
                  returnObj.exception = e;
                  reject(returnObj);
                }
              }
              return response.statusCode < 400 ? resolve(returnObj) : reject(returnObj);
            });
        })
        .on('error', e => {
          returnObj.exception = e;
          reject(returnObj);
        });

      request.write(body);
      request.end();
    });
  }

  /**
   * Returns the given path prefixed with the API's base path, plus query string.
   *
   * @param {string} path
   * @param {object} queryStringParams
   * @returns {string}
   * @private
   */
  _getUri (path, queryStringParams = {}) {

    // Prefix with base path and ensure single slashes
    path = [this.path, path]
      .join('/')
      .replace(/\/+/g, '/');

    var params = Object.assign({}, this.queryStringParams, queryStringParams);
    if (Object.keys(params).length) {
      path += '?' + querystring.stringify(params);
    }
    return path;
  }

  /**
   * @param {string} path
   * @param {object} queryStringParams
   * @param {object} headers
   * @returns {Promise}
   */
  get (path, queryStringParams = {}, headers = {}) {
    return this._request('GET', path, queryStringParams, {}, headers);
  }

  /**
   * @param {string} path
   * @param {object} requestBodyParams
   * @param {object} headers
   * @returns {Promise}
   */
  post (path, requestBodyParams = {}, headers = {}) {
    return this._request('POST', path, {}, requestBodyParams, headers);
  }

  /**
   * @param {string} path
   * @param {object} requestBodyParams
   * @param {object} headers
   * @returns {Promise}
   */
  put (path, requestBodyParams = {}, headers = {}) {
    return this._request('PUT', path, {}, requestBodyParams, headers);
  }

  /**
   * @param {string} path
   * @param {object} requestBodyParams
   * @param {object} headers
   * @returns {Promise}
   */
  patch (path, requestBodyParams = {}, headers = {}) {
    return this._request('PATCH', path, {}, requestBodyParams, headers);
  }

  /**
   * @param {string} path
   * @param {object} headers
   * @returns {Promise}
   */
  "delete" (path, headers = {}) {
    return this._request('DELETE', path, {}, {}, headers);
  }
}

module.exports = RestApiClient;
