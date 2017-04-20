'use strict';

const config = require('collections-online/lib/config');

/**
 * Running the indexing procedure in the all mode.
 */

module.exports.generateQueries = function(state) {
  return Object.keys(config.cip.catalogs)
  .map(catalogAlias => {
    return {
      catalogAlias,
      query: 'ID *'
    };
  });
};
