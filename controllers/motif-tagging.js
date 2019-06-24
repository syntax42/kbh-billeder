'use strict';

const _ = require('lodash');

const motifTagging = require('collections-online-cumulus/controllers/motif-tagging');
const kbhStatsApi = require('../services/kbh-billeder-stats-api');

motifTagging.typeaheadSuggestions = text => {
  // The document service might be registered after this motif tagging service
  const ds = require('collections-online/lib/services/documents');
  // Search for distinct tags in all relevant fields
  return ds.search({
    size: 0,
    body: {
      aggs: {
        tags: {
          terms: {
            'field': 'tags.keyword',
            'include': text + '.*'
          }
        },
        tags_vision: {
          terms: {
            'field': 'tags_vision.keyword',
            'include': text + '.*'
          }
        }
      }
    }
  }).then(response => {
    // Concatenate all the aggregated tags
    let tags = _.concat(
      response.aggregations.tags.buckets,
      response.aggregations.tags_vision.buckets
    ).map(bucket => bucket.key);
    // Sort, putting the most popular on top
    tags.sort(function(tagA, tagB) {
      return tagB.doc_count - tagA.doc_count;
    }).map(function(tag) {
      return tag.key;
    });
    // Remove duplicates
    return _.uniq(tags);
  });
};

const originalUpdateIndex = motifTagging.updateIndex;
motifTagging.updateIndex = metadata => {
  return originalUpdateIndex({
    collection: metadata.collection,
    id: metadata.id,
    tags_vision: metadata.visionTags,
    tags: metadata.userTags
  });
};

// Wrap the call to cumulus to save in a function that will inform the
// kbh-billeder-stats api after a successful save.
const originalSave = motifTagging.save;
motifTagging.save = ({id, collection, userTags, visionTags, userId}) => {
  return originalSave({
    collection, id, userTags, visionTags
  }).then(function() {
    // Pass the same arguments to our save.
    kbhStatsApi.saveTags({
      collection, id, userTags, visionTags, userId
    });
  });
};

module.exports = motifTagging;
