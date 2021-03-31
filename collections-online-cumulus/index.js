let plugins;
try {
  plugins = require('../collections-online/plugins');
} catch(err) {
  throw new Error('This module is a plugin for collections online', err);
}

const config = require('../collections-online/lib/config');
const indexing = require('./indexing/run');

module.exports.registerPlugins = () => {
  if(config.es) {
    plugins.register({
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
    });
  } else {
    console.warn('The Cumulus indexing engine is disabled due to configuation');
  }

  // Register the cumulus specific plugins
  plugins.register(require('./plugins/image-controller'));
};

module.exports.registerRoutes = (app) => {
  var indexController = require('./controllers/index');
  app.post('/index/asset', indexController.asset);
};
