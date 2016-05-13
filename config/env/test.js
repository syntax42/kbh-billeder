'use strict';

module.exports = {
  env: 'test',
  ip: process.env.IP || '0.0.0.0',
  port: process.env.PORT || 9000,
  viewsPath: '/views',
  siteTitle: 'KBH Billeder (beta)',
  esHost: '172.16.1.222:80',
  esAssetsIndex: 'test_assets',
  // googleAnalyticsPropertyID: ''
};
