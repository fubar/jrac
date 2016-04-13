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
    // ...
  })
  .catch(result => {
    // ...
  });
```
"Regular" JS:
```javascript
var RestApiClient = require('jrac');

var booksApi = new RestApiClient('https://www.googleapis.com/books/v1');
booksApi
  .get('volumes', {q: 'isbn:0307400840'})
  .then(function (result) {
    // ...
  })
  .catch(function (result) {
    // ...
  });
```

The constructor accepts any valid URL, including port and query string. Query string parameters
are added as defaults to the URL of all requests. Defaults are overwritten by equally named
query string parameters passed into an individual request.
