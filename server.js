'use strict';
var express = require('express');
var keystone = require('keystone');
var csrf = require('csurf');
var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();
co.config(config);

// Set up Keystone
keystone.init(config.keystone.options);

if(config.cloudinaryUrl) {
  // Set up cloudinary
  keystone.set('cloudinary config', config.cloudinaryUrl);
  // Prefix all built-in tags with 'keystone_'
  keystone.set('cloudinary prefix', 'keystone');
  // Prefix each image public_id with [{prefix}]/{list.path}/{field.path}/
  keystone.set('cloudinary folders', true);
  // Force cloudinary to serve images over https
  keystone.set('cloudinary secure', true);
}

// Richer wysiwyg
keystone.set('wysiwyg additional buttons', 'styleselect, blockquote');

keystone.import('./models');

keystone.initExpressApp(app);
co.initialize(app, [
  require('collections-online-cumulus')
]).then(() => {
  // Keystone form validation
  app.use('/keystone', csrf());
  app.use('/keystone', function(req, res, next) {
    res.locals.csrftoken = req.csrfToken();
    return next();
  });

  keystone.set('routes', require('./routes')(app));
  co.registerRoutes(app);

  keystone.set('nav', config.keystone.nav);

  app.use('/keystone', keystone.Admin.Server.createStaticRouter(keystone));

  app.use(keystone.get('session options').cookieParser);
  app.use(keystone.expressSession);
  app.use(keystone.session.persist);
  app.use(require('connect-flash')());

  app.use('/keystone', keystone.Admin.Server.createDynamicRouter(keystone));

  keystone.openDatabaseConnection(function() {
    require('./menus')(app);
  });

  co.registerErrors(app);
}).then(null, console.error);
