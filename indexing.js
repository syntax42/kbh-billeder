'use strict';

const config = require('./lib/config');
const plugins = require('./plugins');
const collectionsOnlinePlugins = require('./pluginController');

config.setCustomizationPath(__dirname);
plugins.register();

function run(state) {
  // Run the indexing with the first available indexing-engine
  var indexingEngine = collectionsOnlinePlugins.getFirst('indexing-engine');
  return indexingEngine(state || {}).then(function() {
    console.log('\nAll done - good bye!');
    process.exit(0);
  }, function(err) {
    console.error('An error occured!');
    console.error(err.stack || err);
    process.exit(1);
  });
}

run();
