'use strict';

const config = require('../../../shared/config');

/**
 * Running the indexing procedure in the all mode.
 */

module.exports.generateQueries = state => {
  return Object.keys(config.cip.catalogs)
  .map(catalogAlias => {
    return {
      catalogAlias,
      query: 'ID *'
    };
  });
};
