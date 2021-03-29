'use strict';

const index = require('../collections-online-cumulus/controllers/index');
const users = require('../controllers/users');

module.exports = function(app) {
  app.post('/index/asset', index.asset);
  app.get('/healthz', (req, res) => { res.send('ok'); });
  // Setup an API endpoint for fetching contributions. We expect a asset type
  // and a numeric page-number.
  app.get('/min-side/contributions/:assetType/:pageNo(\\d+)', users.fetchUserContributions);

};
