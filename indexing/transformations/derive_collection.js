'use strict';

/**
 * Derives a collection field from the catalog
 */
module.exports = function(state, metadata) {
  metadata.collection = metadata.catalog;
  // Return the updated metedata.
  return metadata;
};
