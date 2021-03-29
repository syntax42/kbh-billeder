const assert = require('assert');
const config = require('../../collections-online/lib/config');
const cip = require('../services/cip');

const USER_FIELD = config.motifTagging && config.motifTagging.userField;
const VISION_FIELD = config.motifTagging && config.motifTagging.visionField;

if(config.features.motifTagging) {
  assert.ok(USER_FIELD, 'Missing a config.motifTagging.userField');
  assert.ok(VISION_FIELD, 'Missing a config.motifTagging.visionField');
}

const motifTagging = {
  save: ({id, collection, userTags, visionTags}) => {
    assert.ok(collection, 'Missing the collection');
    assert.ok(id, 'Missing an asset id');

    // Save it using the CIP
    var values = {};

    if(Array.isArray(userTags)) {
      values[USER_FIELD] = userTags.join(',');
    }

    if(Array.isArray(visionTags)) {
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
  },
  updateIndex: metadata => {
    const indexController = require('./index');
    return indexController.updateAsset(metadata.collection, metadata.id)
    .then(response => {
      return metadata;
    });
  },
  updateIndexFromData: metadata => {
    const indexController = require('./index');
    return indexController.updateAssetsFromData(metadata)
      .then(response => {
        return metadata;
      });
  }
};

module.exports = motifTagging;
