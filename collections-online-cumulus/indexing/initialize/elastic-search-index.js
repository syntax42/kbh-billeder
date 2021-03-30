'use strict';

/**
 * This initializes the ElasticSearch index.
 *
 * @param {Object} state The state of which we are about to initialize.
 */

const es = require('collections-online/lib/services/elasticsearch');
const config = require('collections-online/lib/config');

module.exports = state => {
  // Save the index in the context
  state.context.index = config.es.index;
  console.log('Initializing the Elastic Search index: ' + state.context.index);

  return es.indices.exists({
    index: state.context.index
  })
  .then(function(exists) {
    if (exists) {
      console.log('Index was already created');
      return state;
    }
    var fields = config.types.asset.mapping || {};
    // Get all fields that needs a raw value included in the index
    config.types.asset.fields.filter((field) => {
      return field.includeRaw;
    }).forEach((field) => {
      var fieldName = field.short;
      fields[fieldName] = {
        'type': 'string',
        'analyzer': 'english',
        'fields': {
          'raw': {
            'type': 'string',
            'index': 'not_analyzed'
          }
        }
      };
    });
    // Derive mappings from the asset field types
    // First the fields with date types
    config.types.asset.fields.filter((field) => {
      return field.type === 'date';
    }).forEach((field) => {
      var fieldName = field.short;
      fields[fieldName] = {
        type: 'object',
        properties: {
          timestamp: {type: 'date'}
        }
      };
    });
    // Enumurations should not have their displaystring tokenized
    config.types.asset.fields.filter((field) => {
      return field.type === 'enum';
    }).forEach((field) => {
      var fieldName = field.short;
      fields[fieldName] = {
        type: 'object',
        properties: {
          displaystring: {
            'type': 'string',
            'index': 'not_analyzed'
          }
        }
      };
    });
    // Create the actual index
    return es.indices.create({
      index: state.context.index,
      body: {
        'index': {
          'max_result_window': 100000 // So sitemaps can access all assets
        },
        'mappings': {
          'asset': {
            'properties': fields
          }
        }
      }
    }).then(function() {
      console.log('Index created.');
      return state;
    }, function(err) {
      // TODO: Add a recursive check for this message.
      if (err.message === 'No Living connections') {
        throw new Error('Is the Elasticsearch server running?');
      } else {
        throw err;
      }
    });
  });
};
