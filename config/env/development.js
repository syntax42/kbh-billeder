'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  auth0: {
    callbackURL: 'http://localhost:9000/auth/callback'
  },
  siteTitle: 'kbhbilleder.dk (dev)',
  allowRobots: true,
  es: {
    log: 'error' //use 'trace' for verbose mode
  },
  googleAnalyticsPropertyID: false,
});
