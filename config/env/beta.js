'use strict';

var _ = require('lodash');
var base = require('./base');

const beta = _.merge({}, base, {
  allowRobots: false,
  auth0: {
    callbackURL: 'http://beta.kbhbilleder.reload.dk/auth/callback',
    clientID: 'W6lhfnsLRK3UgBnCAOO3Lmr2lVjd5BDp'
  },
  siteTitle: 'kbhbilleder.dk (beta)',
  env: 'beta',
  features: {
    feedback: true,
    motifTagging: true,
    sitewidePassword: true,
    users: true,
    requireEmailVerification: true
  },
  host: 'beta.kbhbilleder.reload.dk',
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});

module.exports = beta;
