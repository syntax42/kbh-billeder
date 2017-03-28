const assert = require('assert');
const config = require('collections-online/lib/config');
const cip = require('../services/cip');

const USER_FIELD = config.motifTagging && config.motifTagging.userField;
const VISION_FIELD = config.motifTagging && config.motifTagging.visionField;

if(config.features.motifTagging) {
  assert.ok(USER_FIELD, 'Missing a config.motifTagging.userField');
  assert.ok(VISION_FIELD, 'Missing a config.motifTagging.visionField');
}

module.exports.save = ({id, collection, userTags, visionTags}) => {
  assert.ok(collection, 'Missing the collection');
  assert.ok(id, 'Missing an asset id');

  // Save it using the CIP
  var values = {};

  if(userTags === typeof(String)) {
    values[USER_FIELD] = userTags.join(',');
  }

  if(visionTags === typeof(String)) {
    values[VISION_FIELD] = visionTags.join(',');
  }

  // Set the field values via the CIP
  return cip.setFieldValues(collection, id, values)
  .then(function(response) {
    if (response.statusCode !== 200) {
      throw new Error('Failed to set the field values');
    } else {
      return response;
    }
  });
};

module.exports.updateIndex = (metadata) => {
  const es = require('collections-online/lib/services/elasticsearch');
  const index = config.es && config.es.index;
  assert.ok(index, 'Missing config.es.index');

  return es.getSource({
    id: metadata.collection + '-' + metadata.id,
    type: 'asset',
    index
  }).then(metadataBefore => {
    const indexingState = {
      es,
      index
    };
    const transformations = [
      require('../indexing/transformations/tag-hierarchy')
    ];
    const indexAsset = require('../indexing/processing/asset');
    const metadataAfter = Object.assign({}, metadataBefore, metadata);
    return indexAsset(indexingState, metadataAfter, transformations)
    .then(id => {
      return metadataAfter;
    });
  });
};
