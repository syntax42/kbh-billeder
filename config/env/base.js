'use strict';

var path = require('path');
var fs = require('fs');

const CONFIG_DIR = path.join(__dirname, '..');
const TAGS_BLACKLIST_PATH = path.join(CONFIG_DIR, 'tags-blacklist.txt');
var tagsBlacklist = fs.readFileSync(TAGS_BLACKLIST_PATH);
// Get the content, replace windows new-lines and split on new-lines.
tagsBlacklist = tagsBlacklist.toString().replace(/(\r\n|\n|\r)/gm,'\n').split('\n');

const REVIEW_STATE_FIELD = ''; // TODO: Adjust this to a new field GUID.

module.exports = {
  //root: rootPath,
  ip:   process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9000,
  // A list of directories to look for static files and /views
  appPaths: path.join(__dirname, '..', '..', 'app'),
  // Elasticsearch
  esHost: process.env.ES_HOST || 'localhost:9200',
  esAssetsIndex: process.env.ES_ASSETS_INDEX || 'assets',
  // CIP
  cip: {
    baseURL: 'http://www.neaonline.dk/CIP',
    username: process.env.CIP_USERNAME,
    password: process.env.CIP_PASSWORD,
    proxyMaxSockets: 10,
    // rotationCategoryName: 'Rotationsbilleder', // TODO: Disable in indexing.
    indexingRestriction: REVIEW_STATE_FIELD + ' is 3',
    catalogs: require('../cip-catalogs.json'),
  },
  googleAnalyticsPropertyID: null,
  // googleMapsAPIKey: '',
  googleAPIKey: process.env.GOOGLE_API_KEY,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  categoryBlacklist: require('../category-blacklist.js'),
  enableGeotagging: false,
  filterOptions: require('../filter-options.json'),
  sortOptions: require('../sort-options.json'),
  assetFields: require('../asset-fields.json'),
  assetLayout: require('../asset-layout.json'),
  licenseMapping: require('../license-mapping.json'),
  tagsBlacklist: tagsBlacklist,
  themeColor: '#262626',
  appName: 'KBH Billeder',
};
