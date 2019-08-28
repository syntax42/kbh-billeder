'use strict';

// Loading the configuration
var co = require('.');
var plugins = require('./plugins');
co.config(__dirname);

// Loading the configuration
var state = {};

// This registers the cumulus indexing-engine
require('collections-online-cumulus').registerPlugins();

module.exports.run = (state) => {
  // Run the indexing with the first available indexing-engine
  var indexingEngine = plugins.getFirst('indexing-engine');
  return indexingEngine(state || {}).then(function () {
    console.log('\nAll done - good bye!');
    process.exit(0);
  }, function (err) {
    console.error('An error occured!');
    console.error(err.stack || err);
    process.exit(1);
  });
};

// Start the indexing
require('./indexing').run();
