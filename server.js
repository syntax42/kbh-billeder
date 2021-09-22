'use strict';

const config = require('./lib/config');
const ds = require('./lib/services/documents');
const svgSpriteMiddleware = require('./lib/middleware/svg-sprite');
const expressSetup = require('./lib/express');
const helpers = require('./lib/helpers');
const registerRoutes = require('./lib/routes');
const registerRoutesFromIndex = require('./routes');
const registerErrorHandlers = require('./lib/errors');

const plugins = [
  require('./plugins/elasticsearch'),
  require('./plugins/users'),
  require('./plugins/keystone'),
  require('./plugins/auth'),
  require('./plugins/image'),
  require('./plugins/motif-tagging'),
  require('./plugins/geo-tagging'),
  require('./plugins/stats-pre-renderer'),
  require('./plugins/indexing'),
];

const co = {
  initialize: async (app) => {
    if(!app) {
      throw new Error('Needed an Express app when initializing');
    }
    // Setting the NODE_ENV environment if it's not already sat
    // TODO: Consider removing this
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    for(const plugin of plugins) {
      if(plugin.initialize) {
        await plugin.initialize();
      }
    }

    expressSetup(app);

    app.locals.config = config;
    helpers.checkRequiredHelpers();
    app.locals.helpers = helpers;

    // Injects an SVG sprite
    app.use(svgSpriteMiddleware);

    // Trust the X-Forwarded-* headers from the Nginx reverse proxy infront of
    // the app (See http://expressjs.com/api.html#app.set)
    app.set('trust proxy', 'loopback');

    const indices = Object.keys(config.types).map((type) => config.types[type].index);

    try {
      await ensureElasticSearchConnection(ds, config, indices, 10, 1000);
    }
    catch(error) {
      console.log('Elasticsearch not found after several attempts.');
      process.exit(1);
    }

    // Register routes for kbhbilleder
    registerRoutesFromIndex(app);

    // Ask plugins to register their routes
    for(const plugin of plugins) {
      if(plugin.registerRoutes) {
        plugin.registerRoutes();
      }
    }

    // Register the core routes (used to be collections-online routes)
    registerRoutes(app);

    registerErrorHandlers(app);

    console.log('Starting up the server');

    // Start server
    if(config.port && config.ip) {
      app.listen(config.port, config.ip, function() {
        console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
      });
    } else if(config.socketPath) {
      app.listen(config.socketPath, function() {
        console.log('Express server listening on socket %s, in %s mode', config.socketPath, app.get('env'));
      });
    } else {
      throw new Error('Could not start server, needed "port" and "ip" or "socketPath" in the configuration.');
    }
  },
};

async function ensureElasticSearchConnection(ds, config, indices, retries, backoff) {
  let response;
  try {
    response = await ds.count({
      index: indices,
      body: {
        query: config.search.baseQuery
      }
    });
  }
  catch(error) {
    console.error('Could not connect to the Elasticsearch:', 'Is the elasticsearch service started?');
    console.error('Retrying elasticsearch');

    if(retries < 1) {
      throw error;
    }

    return ensureElasticSearchConnection(ds, config, indices, retries - 1, backoff + backoff);
  }

  console.log('Index exists and has', response.count, 'documents.');
}

module.exports = co;
