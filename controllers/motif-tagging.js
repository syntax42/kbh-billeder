const _ = require('lodash');

const motifTagging = require('collections-online-cumulus/controllers/motif-tagging');

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
            'field': 'tags',
            'include': text + '.*'
          }
        },
        tags_vision: {
          terms: {
            'field': 'tags_vision',
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
  })
};

module.exports = motifTagging;
