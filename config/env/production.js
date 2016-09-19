'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'production',
  siteTitle: 'KBH Billeder',
  allowRobots: true,
  es: {
    assetsIndex: 'kbh-billeder-assets'
  },
  googleAnalyticsPropertyID: 'UA-78446616-1'
});
