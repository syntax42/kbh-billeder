'use strict';

module.exports = {
  env: 'production',
  viewsPath: '/views',
  siteTitle: 'KBH Billeder',
  esHost: process.env.ES_HOST || '172.16.1.222:80',
  esAssetsIndex: 'assets',
  // googleAnalyticsPropertyID: ''
};
