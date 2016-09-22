var config = require('collections-online/lib/config');

var cip = require('./services/cip');
var Agent = require('agentkeepalive');
var request = require('request').defaults({
  agent: new Agent({
    maxSockets: config.cip.proxyMaxSockets
  })
});

function proxy(url, next) {
  // Add any available jsessionid, just before any querystring.
  if(url.indexOf('jsessionid') < 0 && cip.jsessionid) {
    let jsessionidString = ';jsessionid=' + cip.jsessionid;
    let queryStringStart = url.indexOf('?');
    if(queryStringStart < 0) {
      url += jsessionidString;
    } else {
      url = url.substring(0, queryStringStart) +
            jsessionidString +
            url.substring(queryStringStart);
    }
  }

  console.log('CIP proxy is requesting', url);

  return request
    .get(url)
    .on('error', function(err) {
      next(err);
    })
    .on('response', function(response){
      response.headers['Cache-Control'] = 'max-age=2592000';
    });
}

module.exports = proxy;
