// Requiring the babel polyfill, to enable Array.prototype.find
// http://babeljs.io/docs/usage/polyfill/
require('babel-polyfill');

module.exports = options => {
  const config = require('../../../collections-online/shared/config');

  require('./mobile');
  require('./search');
  require('./search/series');

  if(config.features.users) {
    require('./auth');
  }

  // TODO: Remove this asset require, once downloading has been moved to a
  // seperate script.
  require('./asset');

  if(config.features.feedback) {
    require('./document/feedback');
  }

  require('./document/expandable');
  require('./document/navigator');
  if(config.features.geoTagging || config.features.motifTagging) {
    require('./document/contribution-counter');
  }
  if(config.features.geoTagging && config.features.geoTagging !== 'override') {
    require('./document/geo-tagging');
  }
  if(config.features.motifTagging) {
    require('./document/motif-tagging');
  }

  if(config.features.scrollToTop) {
    require('./scroll-to-top');
  }


  require('./sidebar-menu');
  require('./dropdown');
  require('./galleries');

  require('./view-mode');
  require('./site-messages');

  window.helpers = options.helpers;
};
