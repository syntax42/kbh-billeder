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

let config = {
  allowRobots: true,
  appDir: appDir,
  appPaths: [
    generatedDir,
    appDir
  ],
  auth0: {
    domain: 'kbhbilleder.eu.auth0.com'
  },
  cache: {
    ttl: 60 * 5 // 5 minutes
  },
  categoryBlacklist: require('../category-blacklist.js'),
  cip: {
    baseURL: 'https://www.neaonline.dk:8443/CIP',
    username: process.env.CIP_USERNAME,
    password: process.env.CIP_PASSWORD,
    proxy: {
      includeSessionId: true,
      maxSockets: 10
    },
    // rotationCategoryName: 'Rotationsbilleder', // TODO: Disable in indexing.
    indexing: {
      additionalFields: null, // Place additional fields to be indexed here ..
      restriction: null, // '{some-guid} is 3'
      inheritMetadata: false,
      transformationsModule: path.join(__dirname, '..', '..', 'indexing', 'transformations')
    },
    catalogs: cipCatalogs,
    client: {
      endpoint: 'https://www.neaonline.dk:8443/CIP/',
      constants: {
          catchAllAlias: "alle",
          layoutAlias: "stadsarkivet"
      },
      catalogAliases: _.invert(cipCatalogs),
      trustSelfSigned: true
    },
    sessionRenewalRate: 30*60*1000, // Once every 30 minutes
    timeout: 55000
  },
  imageTimeoutRedirect: '/billedet-kunne-ikke-downloades',
  keystone: {
    options: {
      'auto update': true,
      'updates': path.join(__dirname, '..', '..', 'updates'),
      'mongo': process.env.MONGO_CONNECTION || 'mongodb://localhost/kbh-billeder',
      'session store': 'mongo',
      'auth': true,
      'user model': 'User',
      'cookie secret': process.env.COOKIE_SECRET || 'not-a-secret',
      'wysiwyg additional buttons': 'styleselect, blockquote',
      'wysiwyg importcss': '/styles/keystone-tiny-mce.css'
    }
  },
  motifTagging: {
    userField: '{64a1e1e9-47d7-46dd-9805-ca474f03c4b9}',
    visionField: '{ba40fa64-6c9c-412a-99f2-5111bd14b40d}'
  },
  cloudinaryUrl: process.env.CLOUDINARY_URL || false,
  downloadOptions: require('../download-options'),
  es: {
    index: 'kbh-billeder-assets',
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
    motifTagging: false,
    filterSidebar: true,
    geoTagging: true,
    keystone: true,
    lazyLoadExpandedAssets: false,
    rotationalImages: false,
    watermarks: true
  },
  generatedDir: generatedDir,
  geoTagging: {
    default: {
      position: {
        latitude: 55.672064,
        longitude: 12.553359
      },
      zoom: 16
    },
    coordinatesField: '{1af283a9-bcc7-44a1-bdd8-b65557017a52}',
    headingField: '{7c7dc8e3-9e71-4d5b-ad8e-e13c3629e54f}'
  },
  googleAnalyticsPropertyID: null,
  googleMapsAPIKey: 'AIzaSyB0sMPv-zV7gciZGIwFVJ3S8ZztA1btqvU',
  ip: process.env.IP || '0.0.0.0',
  licenseMapping: require('../license-mapping.json'),
  metatags: {
    description: 'Udforsk historiske fotografier, kort og tegninger fra Københavns Museum og Københavns Stadsarkivs samlinger.'
  },
  port: process.env.PORT || 9000,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  search: {
    baseQuery: {
      'bool': {
        'must_not': {
          'term': {
            'related.assets.direction': 'parent'
          }
        }
      }
    },
    filters: require('../filters.json'),
    path: 'søg'
  },
  siteTitle: 'kbhbilleder.dk',
  siteSubTitle: 'Københavns billedbårne kulturarv',
  sortOptions: require('../sort-options.json'),
  tagsBlacklist: tagsBlacklist,
  themeColor: '#e61a64',
  translations: require('../translations'),
  types: {
    asset: {
      fields: require('../asset-fields.json'),
      layout: require('../layouts/asset.json'),
      mapping: require('../mappings/asset.json')
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

module.exports = config;
