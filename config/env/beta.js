'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  allowRobots: false,
  auth0: {
    callbackURL: 'http://beta.kbhbilleder.dk/auth/callback'
  },
  siteTitle: 'kbhbilleder.dk (beta)',
  env: 'beta',
  features: {
    sitewidePassword: true
  },
  host: 'beta.kbhbilleder.dk',
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});
