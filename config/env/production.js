'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  allowRobots: true,
  auth0: {
    callbackURL: 'http://kbhbilleder.dk/auth/callback',
    clientID: 'TwmSafM2Tz7YB5ARDA9MmyFh3DKb95cP'
  },
  cip: {
    baseURL: 'https://www.neaonline.dk:8443/CIP',
    client: {
      endpoint: 'https://www.neaonline.dk:8443/CIP/',
      trustSelfSigned: true
    }
  },
  features: {
    geoTagging: false,
    motifTagging: false,
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
