const assert = require('assert');
const config = require('collections-online/lib/config');
const cip = require('../services/cip');

const CROWD_TAGS = config.motifTagging.field;
assert.ok(CROWD_TAGS, 'Missing a config.motifTagging.field');

module.exports.save = (metadata, tags) => {
  if(typeof(tags) === 'string') {
    throw new Error('Saving a single tag is not yet supported');
  }

  const catalog = metadata.catalog;
  assert.ok(catalog, 'Missing the catalog');
  const id = metadata.id;
  assert.ok(catalog, 'Missing an asset id');

  // Save it using the CIP
  var values = {};
  values[CROWD_TAGS] = tags.join(',');
  // Set the field values via the CIP
  return cip.setFieldValues(catalog, id, values)
  .then(function(response) {
    if (response.statusCode !== 200) {
      throw new Error('Failed to set the field values');
    } else {
      return response;
    }
  });
}

module.exports.updateIndex = (metadata) => {
  const es = require('collections-online/lib/services/elasticsearch');
  // TODO: Consider that elasticsearch might not be the only way to update the
  // document index.
  var indexingState = {
    es: es,
    index: config.types.asset.index
  };
  var transformations = [
    require('../indexing/transformations/tag-hierarchy')
  ];
  // The CIP specific indexing code requires a catalog instead of collection
  metadata.catalog = metadata.collection;

  const indexAsset = require('../indexing/processing/asset');
  return indexAsset(indexingState, metadata, transformations);
}
