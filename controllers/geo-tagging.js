const assert = require('assert');

const cip = require('../services/cip');
const config = require('collections-online/lib/config');

if(config.features.geoTagging) {
  assert.ok(config.geoTagging, 'Expected a config.geoTagging');
  assert.ok(config.geoTagging.coordinatesField,
            'Expected config.geoTagging.coordinatesField');
  assert.ok(config.geoTagging.headingField,
            'Expected config.geoTagging.headingField');
}

const geoTagging = {
  save: metadata => {
    var values = {};

    assert.equal(typeof(metadata.latitude), 'number', 'Missing latitude');
    assert.equal(typeof(metadata.longitude), 'number', 'Missing longitude');
    assert.equal(typeof(metadata.heading), 'number', 'Missing nummeric heading');

    const coordinates = [metadata.latitude, metadata.longitude];
    values[config.geoTagging.coordinatesField] = coordinates.join(', ');
    values[config.geoTagging.headingField] = metadata.heading;

    return cip.setFieldValues(metadata.collection, metadata.id, values)
    .then(function(response) {
      if (response.statusCode !== 200) {
        console.error(response.body);
        throw new Error('Failed to set the field values');
      } else {
        console.log('Saved geo-tag on asset: ' +
                    metadata.collection + '/' + metadata.id);
        return metadata;
      }
    })
  },
  updateIndex: metadata => {
    const indexController = require('./index');
    return indexController.updateAsset(metadata.collection, metadata.id)
    .then(response => {
      return metadata;
    });
  }
};

module.exports = geoTagging;
