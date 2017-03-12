'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  appName: 'kbhbilleder.dk (dev)',
  allowRobots: true,
  cip: {
    baseURL: 'https://www.neaonline.dk:8443/CIP',
    client: {
      endpoint: 'https://www.neaonline.dk:8443/CIP/',
      trustSelfSigned: true
    }
  },
  es: {
    log: 'error' //use 'trace' for verbose mode
  },
  googleAnalyticsPropertyID: false,
});
