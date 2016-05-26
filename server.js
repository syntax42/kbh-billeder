'use strict';
var express = require('express');
var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();

// Set up Keystone
var keystone = require('keystone');

keystone.init({
  'name': 'KBH-billeder',

  'static': ['generated'],
  'views': 'app/views',
  'view engine': 'jade',

  'auto update': true,
  'mongo': 'mongodb://localhost/kbh-billeder',

  'session': true,
  'auth': true,
  'user model': 'User',
  'cookie secret': '1234'
});

keystone.import('./models');

keystone.set('routes', require('./routes'));

keystone.set('nav', {
	users: 'users',
	pages: 'pages',
});

keystone.mount('/content', app, function() {
});

// Asking collections online to set-up itself
co.initialize(app, config);
