const config = require('../collections-online/lib/config');
const indexing = require('../indexing/run');

module.exports = {
  type: 'indexing-engine',
  module: indexing,
  registerRoutes: app => {
    app.get('/index/recent', (req, res) => {
      if (config.reindexAccessKey && req.query.accesskey !== config.reindexAccessKey) {
        res.status(401);
        return res.send('Accesskey required.');
      }
      const state = {
        mode: 'recent',
        reference: req.query.timeframe
      };

      indexing(state);
      return res.send('Indexing of recent assets started.');
    });
    app.get('/index/all', (req, res) => {
      if (config.reindexAccessKey && req.query.accesskey !== config.reindexAccessKey) {
        res.status(401);
        return res.send('Accesskey required.');
      }
      const state = {
        mode: 'all',
      };

      indexing(state);
      return res.send('Full reindexing started.');
    });
  }
};
