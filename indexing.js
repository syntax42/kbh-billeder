'use strict';

var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var state = {};
var config = require('./config');
co.config(config);

const ASSET_TRANSFORMATIONS = [
  require('collections-online-cumulus/indexing/transformations/field-names'),
  require('collections-online-cumulus/indexing/transformations/empty-title'),
  require('collections-online-cumulus/indexing/transformations/dates'),
  require('collections-online-cumulus/indexing/transformations/date-intervals'),
  require('collections-online-cumulus/indexing/transformations/categories-and-suggest'),
  require('collections-online-cumulus/indexing/transformations/relations'),
  require('collections-online-cumulus/indexing/transformations/dimensions'),
  require('collections-online-cumulus/indexing/transformations/is-searchable'),
  require('collections-online-cumulus/indexing/transformations/latitude-longitude'),
  require('collections-online-cumulus/indexing/transformations/split-tags'),
  require('collections-online-cumulus/indexing/transformations/category-tags'),
  require('collections-online-cumulus/indexing/transformations/vision-tags'),
  require('collections-online-cumulus/indexing/transformations/tag-hierarchy'),
  require('./indexing/transformations/is_searchable_from_relations')
];

// Configure collections-online
var config = require('./config');
require('collections-online').config(config);

// This registers the cumulus indexing-engine
require('collections-online-cumulus').registerPlugins();
// Start the indexing
require('collections-online/indexing').run({
  assetTransformations: ASSET_TRANSFORMATIONS
});
