'use strict';

var _ = require('lodash');
var base = require('./base');

let enforceHttps = true;

if (process.env.ENFORCE_HTTPS === 'false') {
  enforceHttps = false;
}

const beta = _.merge({}, base, {
  allowRobots: false,
  auth0: {
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'https://beta.kbhbilleder.dk/auth/callback',
    clientID: process.env.AUTH0_CLIENT_ID || 'W6lhfnsLRK3UgBnCAOO3Lmr2lVjd5BDp',
  },
  cip: {
    baseURL: process.env.CUMULUS_API_URL_BETA,
    client: {
      endpoint: process.env.CUMULUS_API_URL_BETA,
    }
  },
  env: 'beta',
  enforceHttps,
  siteTitle: 'kbhbilleder.dk (beta)',
});

module.exports = beta;
