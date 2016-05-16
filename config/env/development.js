'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'development',
  siteTitle: 'KBH Billeder (dev)',
  esAssetsIndex: process.env.ES_ASSETS_INDEX || 'kbh-billeder-assets',
  googleAnalyticsPropertyID: false,
});
