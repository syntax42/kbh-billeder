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

module.exports.updateIndex = (metadata) => {
  throw new Error('Not yet implemented: Implement this in your own plugin');
};

module.exports.save = (metadata) => {
  var values = {};
  values[config.geoTagging.coordinatesField] = metadata.coordinates.join(', ');
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
}
