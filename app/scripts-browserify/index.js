const config = require('collections-online/shared/config');
// Always include collections-online's base
require('base')({
  helpers: require('../../shared/helpers')
});

// Project specific
if(config.googleAnalyticsPropertyID) {
  require('analytics');
}
