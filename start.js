// TODO: Config must have customization set as very first because some modules depend on config being complete at require time (bad, shouldfix)
const config = require('./lib/config');
config.setCustomizationPath(__dirname);

// Creating an express app
const co = require('./server');
const express = require('express');
const app = express();

co.initialize(app)
  .then(() => {
    co.registerRoutes(app);
    co.registerErrors(app);
  })
  .catch(console.error);
