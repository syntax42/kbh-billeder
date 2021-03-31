'use strict';
// Requiring collections-online and loading configuration
const co = require('./collections-online');
co.config(__dirname);
// Register collections-online plugins
require('./plugins').register();

// Start the indexing
require('./collections-online/indexing').run();
