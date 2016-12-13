const cip = require('../services/cip');

var GOOGLE_MAPS_COORDS_CROWD_FIELD = '{81780c19-86be-44e6-9eeb-4e63f16d7215}';
var HEADING_FIELD = '{ef236a08-62f8-485f-b232-9771792d29ba}';

function updateIndex(req, collection, id, latitude, longitude, heading) {
  throw new Error('Needs a reimplementation');
  // Get the assets current metadata from elasticsearch.
  return es.get({
    index: config.type.asset.index,
    type: 'asset',
    id: collection + '-' + id
  }).then(function(response) {
    var indexingState = {
      es: es,
      index: config.types.asset.index
    };
    var metadata = response._source;

    var transformations = [
      require('collections-online-cumulus/indexing/transformations/latitude-longitude')
    ];

    // We can change these as they just changed in the CIP.
    metadata.google_maps_coordinates_crowd = [latitude, longitude].join(', ');
    metadata.heading = heading;

    return indexAsset(indexingState, metadata, transformations);
  });
}

module.exports.save = (metadata) => {
  var values = {};
  values[GOOGLE_MAPS_COORDS_CROWD_FIELD] = metadata.coords.join(', ');
  values[HEADING_FIELD] = metadata.heading;

  return cip.setFieldValues(metadata.collection, metadata.id, 'web', values)
  .then(function(response) {
    if (response.statusCode !== 200) {
      throw new Error('Failed to set the field values');
    }
    // TODO: Consider not returning anything - as it's not used.
    return [req, collection, id, latitude, longitude, heading];
  })
  .spread(updateIndex)
}

module.exports.updateIndex = (metadata) => {
}
