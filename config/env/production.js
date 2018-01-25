'use strict';

var _ = require('lodash');
var base = require('./base');

const production = _.merge({}, base, {
  env: 'production',
  allowRobots: true,
  auth0: {
    callbackURL: 'https://kbhbilleder.dk/auth/callback',
    clientID: 'TwmSafM2Tz7YB5ARDA9MmyFh3DKb95cP',
    // Enable required acceptance of terms and services.
    acceptTermsText: base.auth0TermsText,
  },
  cip: {
    client: {
      logRequests: true
    }
  },
  features: {
    feedback: false,
    geoTagging: false,
    motifTagging: false,
    requireEmailVerification: false,
    users: false
  },
  google: {
    analyticsPropertyID: 'UA-78446616-1'
  },
  host: 'kbhbilleder.dk',
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});

const rows = production.types.asset.layout.sections.place.rows;
const coordinatesIndex = rows.findIndex(r => r.title === 'Koordinater');
delete rows.splice(coordinatesIndex);

module.exports = production;
