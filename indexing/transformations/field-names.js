'use strict';

var assetMapping = require('../../asset-mapping.js');

module.exports = metadata => {
  var transformedMetadata = assetMapping.transform(metadata);
  // The catalog will be removed when formatting.
  transformedMetadata.catalog = metadata.catalog;
  transformedMetadata.collection = metadata.catalog;
  return transformedMetadata;
};
