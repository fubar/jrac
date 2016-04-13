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

## Installation
```
npm install jrac --save
```
## Usage
ES6:
```javascript
import RestApiClient from 'jrac';

var booksApi = new RestApiClient('https://www.googleapis.com/books/v1');
booksApi
  .get('volumes', {q: 'isbn:0307400840'})
  .then(result => {
    console.log(result.bodyObj);
  })
  .catch(result => {
    console.log(result.statusCode, result.exception);
  });
```
"Regular" JS:
```javascript
var RestApiClient = require('jrac');

var booksApi = new RestApiClient('https://www.googleapis.com/books/v1');
booksApi
  .get('volumes', {q: 'isbn:0307400840'})
  .then(function (result) {
    console.log(result.bodyObj);
  })
  .catch(function (result) {
    console.log(result.statusCode, result.exception);
  });
```

Both the success and error handlers get passed an object that has the following properties and default values:
```javascript
{
  exception: null,
  statusCode: null,
  headers: null,
  bodyStr: null,
  bodyObj: {}
}
```
Values are set as available:
- exception: An exception resulting from a try/catch or from a request error
- statusCode: HTTP status code
- headers: An object containing the response headers
- bodyStr: A string containing the raw response body
- bodyObj: The result of running JSON.parse on the raw response body

The constructor accepts any valid URL, including port and query string. Query string parameters
are added as defaults to the URL of all requests. Defaults are overwritten by equally named
query string parameters passed into an individual request.
