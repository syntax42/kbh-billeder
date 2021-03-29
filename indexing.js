'use strict';
// Requiring collections-online and loading configuration
const co = require('../collections-online');
co.config(__dirname);
// Register collections-online plugins
require('./plugins').register();

// Loading the configuration
var state = {};

// This registers the cumulus indexing-engine
require('../collections-online-cumulus').registerPlugins();
// Start the indexing
require('../collections-online/indexing').run();
