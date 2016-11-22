'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  allowRobots: true,
  appName: 'kbhbilleder.dk',
  googleAnalyticsPropertyID: 'UA-78446616-1',
  host: 'kbhbilleder.dk',
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});
