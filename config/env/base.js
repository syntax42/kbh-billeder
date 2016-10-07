'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var CONFIG_DIR = path.join(__dirname, '..');
var TAGS_BLACKLIST_PATH = path.join(CONFIG_DIR, 'tags-blacklist.txt');
var tagsBlacklist = fs.readFileSync(TAGS_BLACKLIST_PATH);
// Get the content, replace windows new-lines and split on new-lines.
tagsBlacklist = tagsBlacklist.toString().replace(/(\r\n|\n|\r)/gm,'\n').split('\n');

var cipCatalogs = require('../cip-catalogs.json');
var generatedDir = path.join(__dirname, '..', '..', 'generated');
var appDir = path.join(__dirname, '..', '..', 'app');

module.exports = {
  //root: rootPath,
  ip:   process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9000,
  allowRobots: true,
  appDir: appDir,
  // A list of directories to look for static files and /views
  appPaths: [
    generatedDir,
    appDir
  ],
  // Elasticsearch
  es: {
    host: process.env.ES_HOST || 'localhost:9200',
    assetsIndex: process.env.ES_ASSETS_INDEX || 'assets',
    log: 'error'
  },
  // CIP
  cip: {
    baseURL: 'http://www.neaonline.dk/CIP',
    username: process.env.CIP_USERNAME,
    password: process.env.CIP_PASSWORD,
    proxyMaxSockets: 10,
    // rotationCategoryName: 'Rotationsbilleder', // TODO: Disable in indexing.
    indexing: {
      additionalFields: null, // Place additional fields to be indexed here ..
      restriction: null, // '{some-guid} is 3'
      inheritMetadata: false,
      transformationsModule: path.join(__dirname, '..', '..', 'indexing', 'transformations')
    },
    catalogs: cipCatalogs,
    client: {
      endpoint: 'http://www.neaonline.dk/CIP/',
      constants: {
          catchAllAlias: "alle",
          layoutAlias: "stadsarkivet"
      },
      catalogAliases: _.invert(cipCatalogs)
    },
    sessionRenewalRate: 30*60*1000 // Once every 30 minutes
  },
  features: {
    geotagging: false,
    rotationalImages: false,
    crowdtagging: false,
    clientSideSearchResultRendering: true,
    filterSidebar: true
  },
  generatedDir: generatedDir,
  googleAnalyticsPropertyID: null,
  // googleMapsAPIKey: '',
  googleAPIKey: process.env.GOOGLE_API_KEY,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  categoryBlacklist: require('../category-blacklist.js'),
  filterOptions: require('../filter-options.json'),
  sortOptions: require('../sort-options.json'),
  assetFields: require('../asset-fields.json'),
  assetLayout: require('../asset-layout.json'),
  licenseMapping: require('../license-mapping.json'),
  searchPath: 'søg',
  tagsBlacklist: tagsBlacklist,
  themeColor: '#262626',
  appName: 'KBH Billeder',
  twitterAccount: {
    'kbh-arkiv': 'kbharkiv',
    'kbh-museum': 'kbenhavnsmuseum'
  },
   // Found using https://developers.facebook.com/tools/explorer
  facebookAppId: {
    'kbh-arkiv': 159598384220080,
    'kbh-museum': 116055131754566
  },
  cloudinaryUrl: process.env.CLOUDINARY_URL || false
};
