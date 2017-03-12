'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  allowRobots: true,
  appName: 'kbhbilleder.dk',
  cip: {
    baseURL: 'https://www.neaonline.dk:8443/CIP',
    client: {
      endpoint: 'https://www.neaonline.dk:8443/CIP/',
      trustSelfSigned: true
    }
  },
  googleAnalyticsPropertyID: 'UA-78446616-1',
  host: 'kbhbilleder.dk',
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});
