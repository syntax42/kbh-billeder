// Creating an express app
const co = require('./server');
const config = require('./lib/config');
const express = require('express');
const app = express();

config.setCustomizationPath(__dirname);

co.initialize(app)
  .then(() => {
    //TODO: inline routes, errors setup in co.initialize
    require('./routes')(app);
    co.registerRoutes(app);
    co.registerErrors(app);
  })
  .catch(console.error);
