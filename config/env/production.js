'use strict';

var _ = require('lodash');
var base = require('./base');

const production = _.merge({}, base, {
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

delete production.search.filters.location;
delete production.search.filters.tags;

const rows = production.types.asset.layout.sections.place.rows;
const coordinatesIndex = rows.findIndex(r => r.title === 'Koordinater');
delete rows.splice(coordinatesIndex);

module.exports = production;
