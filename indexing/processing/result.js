'use strict';

/**
 * The processor handling an entire result.
 */

const _ = require('lodash');
const cip = require('../../services/cip');
const config = require('collections-online/lib/config');
const es = require('collections-online/lib/services/elasticsearch');
const Q = require('q');

const processAsset = require('./asset');

const ASSETS_PER_REQUEST = 100;

function getResultPage(result, index, count) {
  var options = {
    collection: result.collection_id,
    startindex: index,
    maxreturned: count
  };

  if(config.cip.indexing.additionalFields) {
    options.field = config.cip.indexing.additionalFields;
  }
  return cip.request([
    'metadata',
    'getfieldvalues',
    config.cip.client.constants.layoutAlias
  ], options).then((response) => {
    if (!response ||
        !response.body ||
        typeof(response.body.items) === 'undefined') {
      console.error('Unexpected response:', response);
      throw new Error('The request for field values returned an empty result.');
    } else {
      return response.body.items;
    }
  });
}

/**
 * Process a specific result page, with assets.
 */
function processResultPage(result, state, pageIndex) {
  const { catalog } = result;

  var totalPages = Math.ceil(result.total_rows / ASSETS_PER_REQUEST);
  console.log('Queuing page number',
              pageIndex + 1,
              'of',
              totalPages,
              'from the',
              catalog.alias,
              'catalog');

  const count = ASSETS_PER_REQUEST;
  return getResultPage(result, pageIndex * count, count)
  .then(assets => {
    console.log('Got metadata of page',
                pageIndex + 1,
                'from the',
                catalog.alias,
                'catalog');
    const assetPromises = assets.map(function(asset) {
      asset.catalog = catalog.alias;
      // Clone the context for every asset
      const clonedContext = _.cloneDeep(state.context);
      // Process each asset
      return processAsset(asset, clonedContext)
      .then(function(metadata) { // TODO: Refactor to do this once per result
        return es.index({
          index: state.index,
          type: 'asset',
          id: metadata.catalog + '-' + metadata.id,
          body: metadata
        });
      })
      .then(function(resp) {
        console.log('Successfully indexed ' + resp._id);
        return resp._id;
      }, function(err) {
        const msg = 'An error occured! Asset: ' + asset.catalog + '-' + asset.id;
        console.error(msg, err.stack || err.message || err);
        return new AssetIndexingError(metadata.catalog, metadata.id, err);
      });
    });
    return Q.all(assetPromises);
  });
}

function processResultPages(result, state) {
  // Build up a list of parameters for all the pages in the entire result
  const pageIndecies = [];
  for(let p = context.offset; p * ASSETS_PER_REQUEST < result.total_rows; p++) {
    pageIndecies.push(p);
  }
  // Return a promise of process result pages (evaluated one after another)
  return pageIndecies.reduce((indexedAssetsIds, pageIndex) => {
    return Q.when(indexedAssetsIds).then(indexedAssetsIds => {
      return processResultPage(result, state, pageIndex)
      .then(newlyIndexedAssetsIds => {
        return indexedAssetsIds.concat(newlyIndexedAssetsIds);
      });
    });
  }, []);
}

function processResult(state, query, result) {
  console.log('Processing a result of ' + result.total_rows + ' assets');
  // TODO: Support an offset defined by state.catalogPageIndex
  if (!result.pageIndex) {
    result.pageIndex = 0;
  }
  const indexedAssetIds = [];
  const assetExceptions = [];

  return processResultPages(result, state)
  .then(function(indexedAssetIdsOrErrors) {
    indexedAssetIdsOrErrors.forEach(function(idOrError) {
      if (typeof(idOrError) === 'string') {
        indexedAssetIds.push(idOrError);
      } else {
        assetExceptions.push(idOrError);
      }
    });
    return {
      indexedIds: allIndexedIds,
      errors: allErrors
    };
  });
}

module.exports = processResult;
