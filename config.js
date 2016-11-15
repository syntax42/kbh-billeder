'use strict';

var _ = require('lodash');
var path = require('path');

// Allows for environment variables to be set using a .env file
require('dotenv').config({
  silent: true,
  path: path.join(__dirname, '.env')
});

// If no NODE_ENV was specified, we are in development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

console.log('Loading ' + process.env.NODE_ENV + ' configuration');
let config = require('./config/env/' + process.env.NODE_ENV);

// Loading Keystone configuration
config.keystone = {
  options: {
    'name': 'KBH Billeder',
    'brand': 'KBH Billeder',
    'auto update': true,
    'mongo': process.env.MONGO_CONNECTION || 'mongodb://localhost/kbh-billeder',
    'session': 'mongo',
    'auth': true,
    'user model': 'User',
    'cookie secret': process.env.COOKIE_SECRET || 'not-a-secret',
    'wysiwyg cloudinary images': config.cloudinaryUrl ? true : false,
    'wysiwyg importcss': '/styles/keystone-tiny-mce.css'
  },
  nav: {
    users: 'users',
    pages: 'pages',
    'menus': ['menu-items'],
    galleries: ['galleries', 'gallery-items']
  }
}

module.exports = config;
