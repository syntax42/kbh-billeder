'use strict';

var _ = require('lodash');
var base = require('./base');

const development = _.merge({}, base, {
  env: 'development',
  auth0: {
    callbackURL: 'http://kbhbilleder.docker/auth/callback',
    clientID: 'uyTltKDRg1BKu3nzDu6sLpHS44sInwOu',
    // Enable required acceptance of terms and services.
    acceptTermsText: base.auth0TermsText,
  },
  cip: {
    client: {
      logRequests: true
    }
  },
  siteTitle: 'kbhbilleder.dk (dev)',
  allowRobots: true,
  es: {
    log: 'error' //use 'trace' for verbose mode
  },
  features: {
    feedback: true,
    motifTagging: true,
    requireEmailVerification: true,
    users: true,
    exampleData: true
  }
});

module.exports = development;
