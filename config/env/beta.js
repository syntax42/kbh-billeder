'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'beta',
  siteTitle: 'KBH Billeder (beta)',
  allowRobots: false,
  es: {
    assetsIndex: 'kbh-billeder-assets-beta',
  }
});
