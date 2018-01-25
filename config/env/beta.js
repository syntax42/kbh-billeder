'use strict';

var _ = require('lodash');
var base = require('./base');

const beta = _.merge({}, base, {
  allowRobots: false,
  auth0: {
    callbackURL: 'https://beta.kbhbilleder.dk/auth/callback',
    clientID: 'W6lhfnsLRK3UgBnCAOO3Lmr2lVjd5BDp',
    // Enable required acceptance of terms and services.
    acceptTermsText: base.auth0TermsText,
  },
  cip: {
    client: {
      logRequests: true
    }
  },
  env: 'beta',
  features: {
    feedback: true,
    geoTagging: true,
    motifTagging: true,
    requireEmailVerification: true,
    sitewidePassword: true,
    users: true
  },
  host: 'beta.kbhbilleder.dk',
  enforceHttps: true,
  ip: null,
  port: null,
  siteTitle: 'kbhbilleder.dk (beta)',
  socketPath: '/tmp/kbh-billeder.sock'
});

module.exports = beta;
