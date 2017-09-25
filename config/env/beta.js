'use strict';

var _ = require('lodash');
var base = require('./base');

const beta = _.merge({}, base, {
  allowRobots: false,
  auth0: {
    callbackURL: 'https://beta.kbhbilleder.dk/auth/callback',
    clientID: 'W6lhfnsLRK3UgBnCAOO3Lmr2lVjd5BDp'
  },
  cip: {
    client: {
      logRequests: true
    }
  },
  siteTitle: 'kbhbilleder.dk (beta)',
  env: 'beta',
  features: {
    feedback: false,
    geoTagging: false,
    motifTagging: false,
    requireEmailVerification: false,
    sitewidePassword: true,
    users: false
  },
  host: 'beta.kbhbilleder.dk',
  enforceHttps: true,
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});

module.exports = beta;
