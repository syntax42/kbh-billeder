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
  allowRobots: true,
  appDir: appDir,
  appName: 'kbhbilleder.dk',
  appPaths: [
    generatedDir,
    appDir
  ],
  assetFields: require('../asset-fields.json'),
  categoryBlacklist: require('../category-blacklist.js'),
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
  cloudinaryUrl: process.env.CLOUDINARY_URL || false,
  es: {
    host: process.env.ES_HOST || 'localhost:9200',
    log: 'error'
  },
  facebookAppId: {
    // Found using https://developers.facebook.com/tools/explorer
    'kbh-arkiv': 159598384220080,
    'kbh-museum': 116055131754566
  },
  features: {
    cookieConsent: true,
    cookieName: 'kbh-billeder-ok-cookie',
    geotagging: false,
    rotationalImages: false,
    crowdtagging: false,
    filterSidebar: true,
    watermarks: true
  },
  generatedDir: generatedDir,
  googleAnalyticsPropertyID: null,
  googleAPIKey: process.env.GOOGLE_API_KEY,
  ip: process.env.IP || '0.0.0.0',
  licenseMapping: require('../license-mapping.json'),
  metatags: {
    description: 'Udforsk historiske fotografier, kort og tegninger fra Københavns Museums og Københavns Stadsarkivs samlinger.'
  },
  port: process.env.PORT || 9000,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  search: {
    baseQuery: {
      match: {
        'is_searchable': true
      }
    },
    filters: require('../filters.json'),
    path: 'søg'
  },
  sortOptions: require('../sort-options.json'),
  tagsBlacklist: tagsBlacklist,
  themeColor: '#262626',
  thumbnailSizes: ['lille', 'mellem', 'stor', 'originalJPEG', 'original'],
  types: {
    asset: {
      layout: require('../layouts/asset.json'),
      index: 'kbh-billeder-assets'
    }
  },
  twitterAccount: {
    'kbh-arkiv': 'kbharkiv',
    'kbh-museum': 'kbenhavnsmuseum'
  },
  watermarks: {
    'kbh-museum': path.join(appDir, 'images', 'watermarks', 'kbh-museum.png'),
    'kbh-arkiv': path.join(appDir, 'images', 'watermarks', 'kbh-arkiv.png')
  }
};
