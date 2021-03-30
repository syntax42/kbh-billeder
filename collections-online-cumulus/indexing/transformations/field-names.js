'use strict';

var assetMapping = require('../../../asset-mapping.js');

module.exports = (metadata, context) => {
  var transformedMetadata = assetMapping.transform(metadata);
  // Add the collection from the context
  transformedMetadata.collection = context.collection;
  return transformedMetadata;
};
