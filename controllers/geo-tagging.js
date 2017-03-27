const _ = require('lodash');

const geoTagging = require('collections-online-cumulus/controllers/geo-tagging');

const originalSave = geoTagging.save;
geoTagging.save = (metadata) => {
  // TODO: Change the type of the heading field in Cumulus
  metadata.heading = metadata.heading.toString();
  return originalSave.call(geoTagging, metadata)
};

module.exports = geoTagging;
