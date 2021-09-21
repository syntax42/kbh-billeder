'use strict';
const plugins = require('../pluginController');
const config = require('../collections-online/lib/config');

module.exports.register = () => {
  plugins.register(require('./users'));

  if(config.es) {
    plugins.register(require('../collections-online/plugins/elasticsearch'));
  }
  if(config.features.keystone) {
    plugins.register(require('../collections-online/plugins/keystone'));
  }
  if(config.features.users) {
    plugins.register(require('../collections-online/plugins/auth'));
  }

  plugins.register(require('./image'));
  plugins.register(require('./motif-tagging'));
  plugins.register(require('./geo-tagging'));
  plugins.register(require('./stats-pre-renderer'));
  
  if(config.es) {
    plugins.register(require('./indexing'));
  }
};
