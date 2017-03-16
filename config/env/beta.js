'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'beta',
  appName: 'kbhbilleder.dk (beta)',
  allowRobots: false,
  features: {
    sitewidePassword: true
  },
  host: 'beta.kbhbilleder.dk',
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});
