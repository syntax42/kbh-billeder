const config = require('collections-online/shared/config');
// Always include collections-online's base
require('base')({
  helpers: require('../../shared/helpers')
});

// Project specific
require('analytics');

if(config.features.sitewidePassword) {
  require('./sitewide-password');
}
