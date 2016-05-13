'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

const REVIEW_STATE_FIELD = ''; // TODO: Adjust this to a new field GUID.

module.exports = {
  root: rootPath,
  ip:   process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9000,
  cip: {
    baseURL: 'http://www.neaonline.dk/CIP',
    username: process.env.CIP_USERNAME,
    password: process.env.CIP_PASSWORD,
    proxyMaxSockets: 10,
    // rotationCategoryName: 'Rotationsbilleder', // TODO: Disable in indexing.
    indexingRestriction: REVIEW_STATE_FIELD + ' is 3'
  },
  googleAnalyticsPropertyID: null,
  // googleMapsAPIKey: '',
  googleAPIKey: process.env.GOOGLE_API_KEY,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  esHost: process.env.ES_HOST || 'localhost:9200',
  esAssetsIndex: process.env.ES_ASSETS_INDEX || 'assets',
  categoryBlacklist: require('../category-blacklist.js'),
  enableGeotagging: false,
  filterOptions: require('../filter-options.json'),
  sortOptions: require('../sort-options.json'),
  assetFields: require('../asset-fields.json'),
  assetLayout: require('../asset-layout.json'),
  themeColor: '#262626',
  appName: 'KBH Billeder',
};
