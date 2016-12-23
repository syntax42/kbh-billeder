'use strict';
// Requiring collections-online and loading configuration
const co = require('collections-online');
co.config(__dirname);
// Register collections-online plugins
require('./plugins').register();

// Creating an express app
const express = require('express');
const app = express();

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
  app.use('/keystone', keystone.Admin.Server.createDynamicRouter(keystone));

  keystone.openDatabaseConnection(function() {
    require('./menus')(app);
  });

  co.registerErrors(app);
}).then(null, console.error);
