'use strict';
var express = require('express');
var keystone = require('keystone');
var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();

// Set up Keystone
keystone.init({
  'name': 'KBH-billeder',
  'brand': 'KBH-billeder',

  'sass': 'generated',
  'static': 'generated',
  'views': 'app/views',
  'view engine': 'jade',
  'auto update': true,
  'mongo': 'mongodb://localhost/kbh-billeder',
  'session': true,
  'auth': true,
  'user model': 'User',
  'cookie secret': '&#34;fF-ELbvoJ|P6:$&lt;;3c-Cen8OJJy[W1&amp;i@O.M)-%&lt;&gt;QTiTvC93&lt;n;R@!vD@A    6N=7',
});

keystone.import('./models');

keystone.set('routes', require('./routes'));

keystone.set('nav', {
	users: 'users',
	pages: 'pages',
});

keystone.initDatabase();
keystone.initExpressSession();

app.use('/keystone', keystone.Admin.Server.createStaticRouter(keystone));
app.use(express.static('generated'));

app.use(keystone.get('session options').cookieParser);
app.use(keystone.expressSession);
app.use(keystone.session.persist);
app.use(require('connect-flash')());

app.use('/keystone', keystone.Admin.Server.createDynamicRouter(keystone));

//keystone.mount('/content', app, function() {
//});

keystone.openDatabaseConnection(function () {
  // Asking collections online to set-up itself
  co.initialize(app, config);
});

