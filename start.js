// Creating an express app
const co = require('./server');
const express = require('express');
const app = express();

co.initialize(app).then(() => {
  require('./routes')(app);
  co.registerRoutes(app);
  co.registerErrors(app);
}).then(null, console.error);
