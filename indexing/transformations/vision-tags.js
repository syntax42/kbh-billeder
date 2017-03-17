'use strict';

const union = require('lodash/union');
const config = require('collections-online/lib/config');
const cip = require('../../services/cip');
const helpers = require('collections-online/shared/helpers');

const plugins = require('collections-online/plugins');
const motifTagController = plugins.getFirst('motif-tag-controller');
if (!motifTagController) {
  throw new Error('Expected at least one image controller!');
}

module.exports = function(state, metadata) {
  // Let's save some cost and bandwidth and not analyze the asset unless
  // explicitly told. As in run only if one of the indexVison args
  // are specified.
  var runForced = state.indexVisionTagsForce;
  var runDefault = state.indexVisionTags;

  if (runDefault || runForced) {
    if(metadata.tags_vision && !runForced) {
      console.log('Asset has vision tags, skipping it');
      return metadata;
    } else if (metadata.tags_vision) {
      console.log('Asset has vision tags, but we´re forced');
    }
    // increment the counter so we can keep track on when to pause and slow down
    state.indexVisionTagsPauseCounter++;

    // Still here. Let's grab the image directly from Cumulus.
    let path = 'preview/thumbnail/' + metadata.catalog + '/' + metadata.id;
    let url = cip.generateURL(path);

    // Loading here to prevent circular dependency.
    var motif = require('collections-online/lib/controllers/motif-tagging');

    return motif.fetchSuggestions(url, state.indexVisionTagsAPIFilter)
      .then(function(tags) {
        // Convert tags to a comma seperated string
        if (!Array.isArray(metadata.tags_vision)) {
          metadata.tags_vision = [];
        }
        // Hang on to the tags prior to this run
        const tagsBefore = metadata.tags_vision;
        // Override the tags with the new suggestions
        metadata.tags_vision = union(metadata.tags_vision, tags);
        // Calculate the numberOfNewTags
        const numberOfNewTags = metadata.tags_vision.length - tagsBefore.length;

        // If no new tags was added, we don't save
        if (numberOfNewTags === 0) {
          console.log('No new tags found, let´s not save to the CIP.',
                      'Now the asset has', metadata.tags_vision.length, 'tags');
          return metadata;
        } else {
          console.log('Derived', numberOfNewTags, 'new tags.',
                      'Now the asset has', metadata.tags_vision.length, 'tags');
          return motifTagController.save(metadata, metadata.tags_vision)
          .then(function(response) {
            if (response.statusCode !== 200) {
              throw new Error('Failed to set the field values');
            }
            return metadata;
          });
        }
      });
  }
  return metadata;
};
