'use strict';

var _ = require('lodash');
var base = require('./base');

const development = _.merge({}, base, {
  env: 'development',
  auth0: {
    callbackURL: 'http://localhost:9000/auth/callback',
    clientID: 'uyTltKDRg1BKu3nzDu6sLpHS44sInwOu'
  },
  siteTitle: 'kbhbilleder.dk (dev)',
  allowRobots: true,
  es: {
    log: 'error' //use 'trace' for verbose mode
  },
  features: {
    feedback: true,
    motifTagging: true,
    users: true,
    requireEmailVerification: true
  }
});

module.exports = development;
