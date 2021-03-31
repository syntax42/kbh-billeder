'use strict';
const plugins = require('../collections-online/plugins');

module.exports.register = () => {
  plugins.register(require('./users'));
  require('../collections-online').registerPlugins();
  plugins.register(require('./motif-tagging'));
  plugins.register(require('./geo-tagging'));
  plugins.register(require('./stats-pre-renderer'));
  require('../collections-online-cumulus').registerPlugins();
};
