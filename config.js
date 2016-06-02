'use strict';

var _ = require('lodash');

// If no NODE_ENV was specified, we are in development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

console.log('Loading ' + process.env.NODE_ENV + ' configuration');
module.exports = require('./config/env/' + process.env.NODE_ENV);

// Loading Keystone configuration
module.exports.keystone = {
  options: {
    'name': 'KBH Billeder',
    'brand': 'KBH Billeder',
    'auto update': true,
    'mongo': process.env.MONGO_CONNECTION || 'mongodb://localhost/kbh-billeder',
    'session': 'mongo',
    'auth': true,
    'user model': 'User',
    'cookie secret': process.env.COOKIE_SECRET || 'not-a-secret',
  },
  nav: {
    users: 'users',
    pages: 'pages',
    'menus': ['menus', 'menu-items']
  }
}
