let plugins;
try {
  plugins = require('collections-online/plugins');
} catch(err) {
  throw new Error('This module is a plugin for collections online', err);
}

const config = require('collections-online/lib/config');
const indexing = require('./indexing/run');

module.exports.registerPlugins = () => {
  const config = require('collections-online/lib/config');
  if(config.es) {
    plugins.register({
      type: 'indexing-engine',
      module: indexing,
      registerRoutes: app => {
        app.get('/index/recent', (req, res) => {
            const state = {
              mode: 'recent',
              reference: req.query.timeframe
            }

            indexing(state)
            return res.send('Indexing of recent assets started.')
          }
        )
      }
    });
  } else {
    console.warn('The Cumulus indexing engine is disabled due to configuation');
  }

  // Register the cumulus specific plugins
  plugins.register(require('./plugins/image-controller'));

  // TODO: Consider not registering these plugins and instead just provide
  // the controllers for document-service implementing plugins or alternatively
  // implement a tag saver and a document-service updating plugin.
  plugins.register(require('./plugins/geo-tag-controller'));
  plugins.register(require('./plugins/motif-tag-controller'));
};

module.exports.registerRoutes = (app) => {
  var indexController = require('./controllers/index');
  app.post('/index/asset', indexController.asset);
};
