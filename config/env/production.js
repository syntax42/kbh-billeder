'use strict';

var _ = require('lodash');
var base = require('./base');

// Feature "flag" - don't enabled zoom tiles in prod.
base.types.asset.fields = base.types.asset.fields.filter(function( field ) {
  return field.short !== 'zoom_tile_id';
});

const production = _.merge({}, base, {
  allowRobots: true,
  auth0: {
    callbackURL:  process.env.AUTH0_CALLBACK_URL || 'https://kbhbilleder.dk/auth/callback',
    clientID: process.env.AUTH0_CLIENT_ID || 'TwmSafM2Tz7YB5ARDA9MmyFh3DKb95cP',
    // Enable required acceptance of terms and services.
    acceptTermsText: base.auth0TermsText,
  },
  cip: {
    client: {
      logRequests: true
    }
  },
  env: 'production',
  features: {
    feedback: true,
    motifTagging: true,
    requireEmailVerification: true,
    sitewidePassword: false,
    users: true,
    magasinMuseum: true,
    oldProfilePage: false
  },
  google: {
    analyticsPropertyID: 'UA-78446616-1'
  },
  host: 'kbhbilleder.dk',
  enforceHttps: true,
  ip: null,
  port: null,
  socketPath: '/tmp/kbh-billeder.sock'
});

module.exports = production;
