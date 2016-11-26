# JSON REST API Client for Node.js

## Motivation
In my search for a simple and concise client library for HTTP REST APIs, none of the npm modules that I found satisfied
the criteria I was looking for:
- Concise
- Easy to read and use
- Promises
- No unnecessary dependencies
- No unnecessary HTTP abstractions

This client aims to satisfy all those criteria. Enjoy!


## A Note on JSON and UTF-8

JRAC JSON-encodes the body of all requests using `JSON.stringify`, and assumes all request data to be provided in UTF-8.
As such, it sets the `Content-Type` header of all requests to `application/json; charset=utf-8` by default:

```javascript
if (!headers.hasOwnProperty('Content-Type') && !headers.hasOwnProperty('content-type')) {
  headers['Content-Type'] = 'application/json; charset=utf-8';
}
if (!headers.hasOwnProperty('Content-Length') && !headers.hasOwnProperty('content-length')) {
  headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
}
```

As you can see, you can override that behaviour by specifying `Content-Type` and/or `Content-Length` headers per-request
(or for all requests via the class constructor argument).

On the receiving side, JRAC indicates to the server that all responses should be JSON-encoded. This can be overriden in
the same manner:

```javascript
if (!headers.hasOwnProperty('Accept') && !headers.hasOwnProperty('accept')) {
  headers['Accept'] = 'application/json';
}
```


## Installation
```
npm install jrac --save
```


## Usage

### ES6
```javascript
import {RestApiClient, RestApiResponse} from 'jrac';

var booksApi = new RestApiClient('https://www.googleapis.com/books/v1');
booksApi
  .get('volumes', {q: 'isbn:0307400840'})
  .then(response => {
    // response is an instance of RestApiResponse
  })
  .catch(result => {
    if (result instanceof RestApiResponse) {
      // result.statusCode is >= 400
    } else {
      // Instance of Error. See https://nodejs.org/docs/latest/api/errors.html
    }
  });
```

### ES5
```javascript
var RestApiClient = require('jrac').RestApiClient;
var RestApiResponse = require('jrac').RestApiResponse;

var booksApi = new RestApiClient('https://www.googleapis.com/books/v1');
booksApi
  .get('volumes', {q: 'isbn:0307400840'})
  .then(function (response) {
    // response is an instance of RestApiResponse
  })
  .catch(function (result) {
    if (result instanceof RestApiResponse) {
      // result.statusCode is >= 400
    } else {
      // Instance of Error. See https://nodejs.org/docs/latest/api/errors.html
    }
  });
```

## Reference

### `RestApiResponse`

```
RestApiResponse {
    statusCode: {number} HTTP status code
    headers: {Object} HTTP response headers. All keys are lower-case.
    data: {Object} The JSON-decoded response body
}
```

### `RestApiClient`

`constructor (apiUrl, keepConnectionAlive = false)`

- `apiUrl` accepts any valid URL, including port and query string. Query string parameters
present in this URL are added as defaults to the URLs of all requests. Defaults are overwritten
by equally named query string parameters passed into an individual request.
- If `keepConnectionAlive` is set to true, the connection to the server is kept open between requests.

The methods provided by this class map to HTTP methods, each of which returns a promise.

- `get (path, queryStringParams = {}, headers = {})`
- `post (path, requestBodyParams = {}, headers = {})`
- `put (path, requestBodyParams = {}, headers = {})`
- `patch (path, requestBodyParams = {}, headers = {})`
- `delete (path, requestBodyParams = {}, headers = {})`

The promise is resolved with an instance of `RestApiResponse` if the response has a status code that is smaller than 400.
<br> The promise is rejected with an instance of `RestApiResponse` if the response has a status code that is 400 or higher.

If an error occurs, the promise is rejected with an instance of `Error`.
See <https://nodejs.org/docs/latest/api/errors.html> for details.
