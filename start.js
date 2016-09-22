var coPlugins;

try {
  coPlugins = require('collections-online/plugins');
} catch(err) {
  console.error('This module is ment to be run as a plugin for collections online');
  process.exit(1);
}

coPlugins.register('indexing-engine', require('./indexing/run'));

coPlugins.register('image-controller', require('./image-controller'));

coPlugins.register('geo-tagging-saver', {

});
