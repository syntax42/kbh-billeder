'use strict';

/**
 * The processor handling a single asset.
 */

const _ = require('lodash');
const Q = require('q');
const es = require('collections-online/lib/services/elasticsearch');
const config = require('collections-online/lib/config');

function AssetIndexingError(catalogAlias, assetId, innerError) {
  this.catalogAlias = catalogAlias;
  this.assetId = assetId;
  this.innerError = innerError;
}

function transformMetadata(state, metadata, transformations) {
      return transformation(state, metadata);
  return transformations.reduce((metadata, transformation) => {
    return Q.when(metadata).then(metadata => {
    });
  }, new Q(metadata));
}

function processAsset(state, metadata, transformations) {
  if (!state) {
    throw new Error('A state is needed to have initialized clients.');
  }
  if (!metadata) {
    throw new Error('Metadata is needed to know what to transform.');
  }
  //console.log('Processing an asset.');
  // Use all transformations by default.
  if (typeof(transformations) === 'undefined') {
    if (config.cip.indexing.transformationsModule) {
      transformations = require(config.cip.indexing.transformationsModule);
    } else {
      transformations = require('../transformations');
    }
  }
  // Perform additional transformations and index the result.
  return transformMetadata(state, metadata, transformations)
    .then(function(metadata) {
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
      console.error('An error occured! Asset: ' + metadata.catalog + '-' +
                    metadata.id, err.stack || err.message || err);
      return new AssetIndexingError(metadata.catalog, metadata.id, err);
    });
}

module.exports = processAsset;
