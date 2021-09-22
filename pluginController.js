const Q = require('q');

// An object of lists of modules, keyed on their type
const pluginModulesByType = {};
// An array of plugins
const registeredPlugins = [];

exports.register = (plugin) => {
  if(!plugin.type) {
    throw new Error('The plugin was missing a type');
  } else if(!plugin.module) {
    throw new Error('The plugin was missing a module');
  }
  // Let's notify the developer that the plugin was registered
  console.log('A plugin of type "' + plugin.type + '" was registered');
  // Create an array for the plugins of this type, if it doesn't exist
  if(typeof(pluginModulesByType[plugin.type]) !== 'object') {
    pluginModulesByType[plugin.type] = [];
  }
  // Push the plugin to the list
  pluginModulesByType[plugin.type].push(plugin.module);
  registeredPlugins.push(plugin);
};

exports.initialize = (app, config) => {
  // Initialize every plugin package
  var pluginPromises = registeredPlugins.map((plugin) => {
    if(typeof(plugin.initialize) === 'function') {
      return Q.when(plugin.initialize(app, config));
    } else {
      return Q.when(undefined);
    }
  });
  // Return a promise that gets resolved when all plugins have initialized
  // Wrapping Q in native Promise, so we can use await on it
  return new Promise((resolve, reject) => {
    Q.all(pluginPromises)
      .then(resolve)
      .catch(reject);
  });
};

exports.registerRoutes = app => {
  // Require routes from each plugin, if they register routes
  registeredPlugins.forEach(plugin => {
    try {
      if(typeof(plugin.registerRoutes) === 'function') {
        plugin.registerRoutes(app);
      }
    } catch (err) {
      console.error('Error registering routes for a plugin: ', err);
    }
  });
  console.log('Setting up routing for the collections-online core');
};
