'use strict';

var _ = require('lodash');
var base = require('./base');

const development = _.merge({}, base, {
  env: 'development',
  auth0: {
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:9000/auth/callback',
    clientID: process.env.AUTH0_CLIENT_ID || 'uyTltKDRg1BKu3nzDu6sLpHS44sInwOu',
  },
  cip: {
    client: {
      logRequests: true
    }
  },
  kbhAccessKey: process.env.KBH_ACCESS_KEY,
  siteTitle: 'kbhbilleder.dk (dev)',
  allowRobots: true,
  es: {
    log: 'error' //use 'trace' for verbose mode
  },
});

module.exports = development;
