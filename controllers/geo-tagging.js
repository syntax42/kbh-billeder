'use strict';
const _ = require('lodash');

const geoTagging = require('../collections-online-cumulus/controllers/geo-tagging');
const kbhStatsApi = require('../services/kbh-billeder-stats-api');

// Override methods on geoTagging as needed.

// Wrap the call to cumulus to save in a function that will inform the
// kbh-billeder-stats api after a successful save.
const originalSave = geoTagging.save;
geoTagging.save = (metadata) => {
  return originalSave(metadata).then(function() {
    // Pass the same arguments to our save.
    return kbhStatsApi.saveGeoTag(metadata);
  });
};

module.exports = geoTagging;
