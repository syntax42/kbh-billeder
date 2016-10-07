var plugins;
try {
  plugins = require('collections-online/plugins');
} catch(err) {
  console.error('This module is ment to be run as a plugin for collections online');
  console.error(err);
  process.exit(1);
}

module.exports.registerPlugins = () => {
  plugins.register('indexing-engine', require('./indexing/run'));
  plugins.register('image-controller', require('./controllers/image'));
  plugins.register('geo-tagging-saver', null);
};

module.exports.registerRoutes = (app) => {
  var indexController = require('./controllers/index');
  app.post('/index/asset', indexController.asset);
};

// Initialize the cip client and make sure a valid session exists
module.exports.initialize = (app, config) => {
  var cip = require('./services/cip');
  return cip.initSession().then(() => {
    return require('./cip-categories').initialize(app)
  }).then(() => {
    setInterval(() => {
      // Consider calling close session ..
      cip.sessionRenew();
    }, config.cip.sessionRenewalRate || 60*60*1000);
    console.log('CIP session initialized');
  });
};
