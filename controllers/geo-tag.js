const cip = require('../services/cip');

var GOOGLE_MAPS_COORDS_CROWD_FIELD = '{81780c19-86be-44e6-9eeb-4e63f16d7215}';
var HEADING_FIELD = '{ef236a08-62f8-485f-b232-9771792d29ba}';

module.exports.updateIndex = {
  throw new Error('Not yet implemented: Implement this in your own plugin');
};

module.exports.save = (metadata) => {
  var values = {};
  values[GOOGLE_MAPS_COORDS_CROWD_FIELD] = metadata.coordinates.join(', ');
  values[HEADING_FIELD] = metadata.heading;

  return cip.setFieldValues(metadata.collection, metadata.id, 'web', values)
  .then(function(response) {
    if (response.statusCode !== 200) {
      console.error(response.body);
      throw new Error('Failed to set the field values');
    }
  })
}
