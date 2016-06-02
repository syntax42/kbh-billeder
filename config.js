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
    'static': 'generated',
    'views': 'app/views',
    'view engine': 'jade',
    'auto update': true,
    'mongo': process.env.MONGO_CONNECTION || 'mongodb://localhost/kbh-billeder',
    'session': 'mongo',
    'auth': true,
    'user model': 'User',
    'cookie secret': 'r49utut94ghqnrnfi3ut3dewri34r43rwf;qf43ff4f4fl[gl]eg][4u902u3204u2dwdzfef',
  },
  nav: {
    users: 'users',
    pages: 'pages',
    'menus': ['menus', 'menu-items']
  }
}
