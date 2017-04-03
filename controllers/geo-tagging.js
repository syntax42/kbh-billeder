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
      require('../indexing/transformations/latitude-longitude')
    ];
    const indexAsset = require('../indexing/processing/asset');
    const metadataAfter = Object.assign({}, metadataBefore, metadata);
    return indexAsset(indexingState, metadataAfter, transformations)
    .then(id => {
      return metadataAfter;
    });
  });
};

module.exports.save = (metadata) => {
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
}
