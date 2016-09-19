'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  siteTitle: 'KBH Billeder (dev)',
  allowRobots: true,
  es: {
    assetsIndex: process.env.ES_ASSETS_INDEX || 'kbh-billeder-assets',
    log: 'error' //use 'trace' for verbose mode
  },
  googleAnalyticsPropertyID: false,
});
