'use strict';

/** @link https://nodejs.org/api/http.html */
var http = require('http');
var querystring = require('querystring');

/**
 * @class RestApiClient
 * @author Phil G <fubar@phil-g.com>
 *
 * A JSON REST API client for Node.js with promises and minimal dependencies.
 *
 * Usage:
 *
 * var client = new RestApiClient('http://www.timeapi.org', 80);
 * client.get('/utc/now')
 *   .then(utcTime => {
 *     // ...
 *   })
 *   .catch(errorMessage => {
 *     // ...
 *   });
 */
class RestApiClient {

  /**
   * @param {string} apiUrl If no schema is included, HTTPS is assumed.
   * @param {number} port Defaults to 443
   * @param {boolean} keepConnectionAlive Defaults to false
   */
  constructor (apiUrl, port = 443, keepConnectionAlive = false) {
    this.protocol = (apiUrl.substr(0, 7) === 'http://') ? 'http:' : 'https:';
    this.apiUrl = apiUrl.replace(/^https?:\/\//i, ""); // strip http:// and https://
    this.port = port;
    this.keepConnectionAlive = keepConnectionAlive;
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {object} queryStringParams
   * @param {object} requestBodyParams
   * @param {object} headers
   * @returns {Promise}
   * @private
   */
  _request (method, path, queryStringParams = {}, requestBodyParams = {}, headers = {}) {

    headers['Accept'] = 'application/json';
    var body = '';

    if (queryStringParams.length) {
      path += '?' + querystring.stringify(queryStringParams);
    }
    if (this.keepConnectionAlive) {
      headers['Connection'] = 'keep-alive';
    }
    if (['POST', 'PUT', 'PATCH'].indexOf(method) !== -1) {
      body = JSON.stringify(requestBodyParams);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = body.length;
    }
    var options = {
      protocol: this.protocol,
      hostname: this.apiUrl,
      port: this.port,
      method: method,
      path: path,
      headers: headers
    };
    return new Promise((resolve, reject) => {

      var req = http.request(options, response => {

        if (response.statusCode !== 200) {
          reject('HTTP ' + response.statusCode);
        }

        var body = '';
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () => {
          // No more data in response
          try {
            resolve(JSON.parse(body), response.headers);
          } catch (e) {
            reject(e.message);
          }
        })
      });

      req.on('error', e => {
        reject(e.message);
      });

      if (body.length) {
        req.write(body);
      }
      req.end();
    });
  }

  /**
   * @param {string} path
   * @param {object} queryStringParams
   * @returns {Promise}
   */
  get (path, queryStringParams = {}) {
    return this._request('GET', path, queryStringParams);
  }

  /**
   * @param {string} path
   * @param {object} requestBodyParams
   * @returns {Promise}
   */
  post (path, requestBodyParams = {}) {
    return this._request('POST', path, {}, requestBodyParams);
  }

  /**
   * @param {string} path
   * @param {object} requestBodyParams
   * @returns {Promise}
   */
  put (path, requestBodyParams = {}) {
    return this._request('PUT', path, {}, requestBodyParams);
  }

  /**
   * @param {string} path
   * @param {object} requestBodyParams
   * @returns {Promise}
   */
  patch (path, requestBodyParams = {}) {
    return this._request('PATCH', path, {}, requestBodyParams);
  }

  /**
   * @param {string} path
   * @returns {Promise}
   */
  del (path) {
    return this._request('DELETE', path);
  }
}

module.exports = RestApiClient;
