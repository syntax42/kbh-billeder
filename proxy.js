
var config = require('collections-online/lib/config');
var cip = require('./services/cip');

var Agent = require('agentkeepalive');
let agent;
// Choose a keep-alive agent based on the beginning of the baseUrl
if(config.cip.baseURL.indexOf('https://') === 0) {
  agent = new Agent.HttpsAgent({
    maxSockets: config.cip.proxyMaxSockets
  });
} else {
  agent = new Agent({
    maxSockets: config.cip.proxyMaxSockets
  });
}

var request = require('request').defaults({
  agent,
  timeout: config.cip.timeout || 55000 // 55 secs
});

function proxy(url, includeJSessionId = false) {
  // Prefix the baseURL
  url = config.cip.baseURL + url;
  // Add any available jsessionid, just before any querystring.
  if(url.indexOf('jsessionid') < 0 && cip.jsessionid && includeJSessionId) {
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
    .get({
      url,
      rejectUnauthorized: config.cip.client.trustSelfSigned ? false : true
    })
    .on('response', function(response) {
      response.headers['Cache-Control'] = 'max-age=2592000';
    });
}

module.exports = proxy;
