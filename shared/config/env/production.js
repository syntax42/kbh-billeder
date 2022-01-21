'use strict';

var _ = require('lodash');
var base = require('./base');

let enforceHttps = true;

if (process.env.ENFORCE_HTTPS === 'false') {
  enforceHttps = false;
}

const production = _.merge({}, base, {
  auth0: {
    callbackURL:  process.env.AUTH0_CALLBACK_URL || 'https://kbhbilleder.dk/auth/callback',
    clientID: process.env.AUTH0_CLIENT_ID || 'TwmSafM2Tz7YB5ARDA9MmyFh3DKb95cP',
  },
  env: 'production',
  google: {
    analyticsPropertyID: 'UA-78446616-1'
  },
  enforceHttps,
});

module.exports = production;
