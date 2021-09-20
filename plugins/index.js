'use strict';
const plugins = require('../collections-online/plugins');
const config = require('../collections-online/lib/config');

module.exports.register = () => {
  plugins.register(require('./users'));
  require('../collections-online/server').registerPlugins();
  plugins.register(require('./image'));
  plugins.register(require('./motif-tagging'));
  plugins.register(require('./geo-tagging'));
  plugins.register(require('./stats-pre-renderer'));
  
  if(config.es) {
    plugins.register(require('./indexing'));
  }
};
