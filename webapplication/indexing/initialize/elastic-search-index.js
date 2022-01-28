'use strict';

/**
 * This initializes the ElasticSearch index.
 *
 * @param {Object} state The state of which we are about to initialize.
 */

const es = require('../../lib/services/elasticsearch');
const config = require('../../../shared/config');

module.exports = (state) => {
  // Save the index in the context
  state.context.index = config.es.assetIndex; //TODO: replace all through with both indexes -- or remove use altogether seeing as index is from config
  console.log('Initializing the Elastic Search index: ' + state.context.index);

  return Promise.all([
    es.indices.exists({index: config.es.assetIndex}),
    es.indices.exists({index: config.es.seriesIndex}),
  ])
    .then(([{body: assetIndexExists}, {body: seriesIndexExists}]) => {
      const indicesToCreate = [];
      const assetMapping = getAssetMapping();
      if(!assetIndexExists) {
        indicesToCreate.push({
          index: config.es.assetIndex,
          mappings: assetMapping,
        });
      }

      if(!seriesIndexExists) {
        indicesToCreate.push({
          index: config.es.seriesIndex,
          mappings: getSeriesMapping(assetMapping),
        });
      }

      if(indicesToCreate.length < 1) {
        return state;
      }

      return Promise.all(indicesToCreate.map((def) => createIndex(def)))
        .then(() => {
          console.log('Indices created:', indicesToCreate);
          return state;
        });
    });

  //TODO: move createIndex and getAssetMapping top level

  function createIndex({index, mappings}) {
    return es.indices.create({
      index,
      body: {
        settings: {
          max_result_window: 100000 // So sitemaps can access all assets
        },
        mappings,
      },
    })
      .catch((error) => {
        console.error('Error while creating index', index);
        console.dir(mappings, {depth: 10});
        console.dir(error, {depth:10});
        throw error;
      });
  }

  function getAssetMapping() {
    let fields = config.types.asset.mapping || {};
    fields.id = {
      type: 'long',
      fields: {
        raw: {
          type: 'text',
          index: false,
        },
      },
    };

    fields.series_ids = {
      type: 'keyword',
    };

    const fieldDefinitions = [
      ...config.types.asset.fields,

      // Generated fields that are not indexed from cumulus
      {short: 'height_cm', type: 'float'},
      {short: 'width_cm', type: 'float'},
      {short: 'height_px', type: 'float'},
      {short: 'width_px', type: 'float'},
    ];

    // Get all fields that needs a raw value included in the index
    fieldDefinitions
      .filter((field) => field.includeRaw)
      .forEach((field) => {
        fields[field.short] = {
          type: 'text',
          fields: {
            raw: {
              type: 'text',
              index: false,
            },
          },
        };
      });

    // Derive mappings from the asset field types
    // First the fields with date types
    fieldDefinitions
      .filter((field) => field.type === 'date')
      .forEach((field) => {
        fields[field.short] = {
          type: 'object',
          properties: {
            timestamp: {type: 'date'},
          },
        };
      });

    // Enumurations should not have their displaystring tokenized
    fieldDefinitions
      .filter((field) => field.type === 'enum')
      .forEach((field) => {
        fields[field.short] = {
          type: 'object',
          properties: {
            displaystring: {
              type: 'text',
              index: false,
            }
          }
        };
      });

    // Other fields with type
    fieldDefinitions
      .filter(({includeRaw, type}) => type && !includeRaw && !['date','enum'].includes(type))
      .forEach(({short, type}) => fields[short] = {type});

    return {properties: fields};
  }

  function getSeriesMapping(assetMapping) {
    return {
      properties: {
        url: {
          type: 'keyword'
        },
        title: {
          type: 'text',
        },
        description: {type: 'text'},
        tags: {type: 'text'},
        assets: {type: 'keyword'},
        previewAssets: assetMapping,
        dateFrom: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'date'
            }
          }
        },
        dateTo: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'date'
            }
          }
        }
      }
    };
  }
};
