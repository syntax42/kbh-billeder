'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var CONFIG_DIR = path.join(__dirname, '..');
var TAGS_BLACKLIST_PATH = path.join(CONFIG_DIR, 'tags-blacklist.txt');
var tagsBlacklist = fs.readFileSync(TAGS_BLACKLIST_PATH);
// Get the content, replace windows new-lines and split on new-lines.
tagsBlacklist = tagsBlacklist.toString().replace(/(\r\n|\n|\r)/gm, '\n').split('\n');

var cipCatalogs = require('../cip-catalogs.json');
var generatedDir = path.join(__dirname, '..', '..', '..', 'assets-pipeline/generated');
var appDir = path.join(__dirname, '..', '..', '..', 'assets-pipeline/app');
var sharedDir = path.join(__dirname, '..', '..');

let config = {
  allowRobots: true,
  appDir: appDir,
  appPaths: [
    generatedDir,
    appDir,
    sharedDir,
  ],
  auth0: {
    domain: 'kbhbilleder.eu.auth0.com',
    // Pr. default we allow the user to sign up without accepting terms. If you
    // want to require acceptance, set this key to the text that should be
    // displayed to the user in the signup box.
    acceptTermsText: 'Jeg accepterer <a href="/regler-og-vilkar-for-deltagelse" target="_new">Regler og vilkår</a> for deltagelse på kbhbilleder.dk',
  },
  cache: {
    ttl: 60 * 5 // 5 minutes
  },
  categoryBlacklist: [],
  cip: {
    baseURL: process.env.CUMULUS_API_URL,
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
      transformationsModule: path.join(__dirname, '..', '..', '..', 'webapplication/indexing/transformations'),
    },
    catalogs: cipCatalogs,
    client: {
      endpoint: process.env.CUMULUS_API_URL,
      authMechanism: 'http-basic',
      username: process.env.CIP_USERNAME,
      password: process.env.CIP_PASSWORD,
      logRequests: true,
      constants: {
        catchAllAlias: "alle",
        layoutAlias: "stadsarkivet"
      },
      catalogAliases: _.invert(cipCatalogs),
      trustSelfSigned: true
    },
    sessionRenewalRate: 30 * 60 * 1000, // Once every 30 minutes
    timeout: 300000
  },
  email: {
    baseUrl: '@api.eu.mailgun.net/v3/mg.kbhbilleder.dk',
    mailgunKey: process.env.MAILGUN_API_KEY,
    // Email to send errors to.
    fallbackEmailTo: process.env.FALLBACK_EMAIL_TO || 'daf@kff.kk.dk',
    fallbackEmailFrom: process.env.FALLBACK_EMAIL_FROM || 'postmaster@kbhbilleder.dk'
  },
  imageTimeoutRedirect: '/billedet-kunne-ikke-downloades',
  kbhBillederStatsApi: {
    baseUrl: process.env.KBHSTATSAPI_URL || 'http://kbhbilleder-stats-production.xxfpqizzz3.eu-west-1.elasticbeanstalk.com',
    cacheTTL: process.env.KBHSTATAPI_CACHE_TTL || 100,
    cacheTTLCheck: process.env.KBHSTATAPI_CACHE_TTL_CHECK || 120,
  },
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
    'kbh-arkiv': process.env.FACEBOOK_APP_ID_KBH_ARKIV || 159598384220080,
    'kbh-museum': process.env.FACEBOOK_APP_ID_KBH_MUSEUM || 116055131754566
  },
  features: {
    feedback: true,
    motifTagging: true,
    filterSidebar: true,
    geoTagging: 'override',
    keystone: true,
    lazyLoadExpandedAssets: false,
    rotationalImages: false,
    watermarks: true,
    preferTargetBlank: false,
    enableVisionTagSuggestions: false,
    enableGoogleTranslate: false,
    magasinMuseum: true,
    users: true,
    oldProfilePage: false,
    sitewidePassword: ['beta.kbhbilleder.dk'],
  },
  feedback: {
    maxLength: 600,
    recipients: 'kbhbilleder@kff.kk.dk',
    fromAddress: 'Feedback@kbhbilleder.dk'
  },
  generatedDir: generatedDir,
  geoTagging: {
    approximateCoordinatesField: '{7a1f29a3-e389-4fef-a092-67de7837a181}',
    coordinatesField: '{1af283a9-bcc7-44a1-bdd8-b65557017a52}',
    headingField: '{7c7dc8e3-9e71-4d5b-ad8e-e13c3629e54f}',
    // Initial centerpoint for the search map and assets without locations.
    initialCenter: {
      lat: 55.675484678282146,
      lon: 12.570029708088803
    }
  },
  google: {
    analyticsPropertyID: null,
    keys: {
      restricted: 'AIzaSyB0sMPv-zV7gciZGIwFVJ3S8ZztA1btqvU',
      unrestricted: process.env.GOOGLE_UNRESTRICTED_API_KEY
    }
  },
  httpWhitelist: [
    '/healthz',
    '/index/asset'
  ],
  ip: process.env.IP || '0.0.0.0',
  licenseMapping: require('../license-mapping.json'),
  metatags: {
    description: 'Udforsk historiske fotografier, kort og tegninger fra Københavns Museum og Københavns Stadsarkivs samlinger.'
  },
  port: process.env.PORT || 9000,
  projectOxfordAPIKey: process.env.PROJECT_OXFORD_API_KEY,
  kbhAccessKey: process.env.KBH_ACCESS_KEY,
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
    path: 'søg',
    contributionsPageSize: 50
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
    'kbh-arkiv': path.join(appDir, 'images', 'watermarks', 'kbh-arkiv.png'),
    'frb-arkiv': path.join(appDir, 'images', 'watermarks', 'frb-arkiv.png'),
    'magasin-museum': path.join(appDir, 'images', 'watermarks', 'magasin-museum.png'),
    'det-danske-filminstitut': path.join(appDir, 'images', 'watermarks', 'det-danske-filminstitut.png'),
  },
  thumbnailSize: 500
};

module.exports = config;
