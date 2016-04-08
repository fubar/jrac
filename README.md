# JSON REST API Client for Node.js

## Motivation
In my search for a simple and concise client library for HTTP REST APIs, none of the npm modules that I found satisfied the criteria I was looking for:
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
```javascript
var RestApiClient = require('jrac');

var client = new RestApiClient('http://www.timeapi.org', 80);
client.get('/utc/now')
  .then(utcTime => {
    // ...
  })
  .catch(errorMessage => {
    // ...
  });
  ```
