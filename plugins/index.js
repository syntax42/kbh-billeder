'use strict';
const plugins = require('../pluginController');

module.exports.register = () => {
  plugins.register(require('./users'));
  plugins.register(require('./elasticsearch'));
  plugins.register(require('./keystone'));
  plugins.register(require('./auth'));
  plugins.register(require('./image'));
  plugins.register(require('./motif-tagging'));
  plugins.register(require('./geo-tagging'));
  plugins.register(require('./stats-pre-renderer'));
  plugins.register(require('./indexing'));
};
