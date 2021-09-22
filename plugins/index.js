'use strict';
const plugins = require('../pluginController');
const config = require('../lib/config');

module.exports.register = () => {
  plugins.register(require('./users'));

  if(config.es) {
    plugins.register(require('../plugins/elasticsearch'));
  }
  if(config.features.keystone) {
    plugins.register(require('./keystone'));
  }
  if(config.features.users) {
    plugins.register(require('../plugins/auth'));
  }

  plugins.register(require('./image'));
  plugins.register(require('./motif-tagging'));
  plugins.register(require('./geo-tagging'));
  plugins.register(require('./stats-pre-renderer'));
  
  if(config.es) {
    plugins.register(require('./indexing'));
  }
};
