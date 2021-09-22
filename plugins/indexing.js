const config = require('../lib/config');

module.exports = {
  registerRoutes: app => {
    app.get('/index/recent', (req, res) => {
      if (config.kbhAccessKey && req.query.accesskey !== config.kbhAccessKey) {
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
      if (config.kbhAccessKey && req.query.accesskey !== config.kbhAccessKey) {
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
