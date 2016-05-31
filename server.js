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
keystone.init(config.keystone.options);
keystone.import('./models');
keystone.set('routes', require('./routes')(app));
keystone.set('nav', config.keystone.nav);

keystone.initDatabase();
keystone.initExpressSession();

app.use('/keystone', keystone.Admin.Server.createStaticRouter(keystone));

app.use(keystone.get('session options').cookieParser);
app.use(keystone.expressSession);
app.use(keystone.session.persist);
app.use(require('connect-flash')());

app.use('/keystone', keystone.Admin.Server.createDynamicRouter(keystone));

keystone.openDatabaseConnection(() => {
  // Asking collections online to set-up itself
  co.initialize(app, config);
});
