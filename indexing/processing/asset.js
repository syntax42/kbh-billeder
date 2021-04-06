'use strict';

/**
 * The processor handling a single asset.
 */

const _ = require('lodash');
const Q = require('q');
const config = require('../../collections-online/lib/config');

function transformMetadata(metadata, context, transformations) {
  return transformations.reduce((metadata, transformation) => {
    return Q.when(metadata).then(metadata => {
      return transformation(metadata, context);
    });
  }, metadata);
}

function processAsset(metadata, context, transformations) {
  if (!metadata) {
    throw new Error('Metadata is needed to know what to transform.');
  }
  if (!context) {
    throw new Error('A context is needed.');
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
  // Perform transformations.
  return transformMetadata(metadata, context, transformations)
  .then(metadata => {
    return {
      metadata,
      context
    };
  });
}

module.exports = processAsset;
