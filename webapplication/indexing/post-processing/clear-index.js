'use strict';

/**
 * The post processing step that clears the index when in clear mode.
 */

const es = require('../../lib/services/elasticsearch');
const config = require('../../../shared/config');

module.exports = function(state) {
  if (state.mode === 'clear') {
    return es.indices.delete({
      index: [config.es.assetIndex, config.es.seriesIndex]
    }).then(function() {
      console.log('Index cleared.');
      return state;
    });
  } else {
    return state;
  }
};
