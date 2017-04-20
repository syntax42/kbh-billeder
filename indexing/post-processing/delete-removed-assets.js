'use strict';

/**
 * The post processing step that steps through all currently indexed assets
 * and deletes every asset that was not indexed during this run of the update to
 * the index.
 */

const Q = require('q');
const es = require('collections-online/lib/services/elasticsearch');
const _ = require('lodash');

module.exports = function(state) {
  var activity = 'Post-processing to delete removed assets';

  console.log('\n=== ' + activity + ' ===');

  if (['all', 'catalog', 'single'].indexOf(state.mode) !== -1) {
    var deletedAssetIds;
    if (state.mode === 'all' || state.mode === 'catalog') {
      deletedAssetIds = state.queries.reduce(function(deletedAssetIds, query) {
        console.log('- Indexed',
                    query.indexedAssetIds.length,
                    'assets from',
                    query.catalogAlias);
        return deletedAssetIds.then(function(deletedAssetIds) {
          if (query.offset > 0) {
            console.log('Skipping a query that had a non-zero offset.');
            return deletedAssetIds;
          }
          // Scroll search for all assets in the catalog that was not indexed.
          return es.scrollSearch({
            'query': {
              'bool': {
                'must': {
                  'match': {
                    'catalog.raw': query.catalogAlias
                  }
                },
                'must_not': {
                  'ids': {
                    'values': query.indexedAssetIds
                  }
                }
              }
            }
          }, function(deletedAsset) {
            deletedAssetIds.push(deletedAsset._id);
          }).then(function() {
            return deletedAssetIds;
          });
        });
      }, new Q([]));
    } else {
      deletedAssetIds = state.queries.reduce((deletedAssetIds, query) => {
        var assetIds = query.assetIds.map(assetId => {
          return query.catalogAlias + '-' + assetId;
        });
        var moreDeletedAssetIds = _.difference(assetIds, query.indexedAssetIds);
        return _.union(deletedAssetIds, moreDeletedAssetIds);
      }, []);
    }

    return Q.when(deletedAssetIds).then(deletedAssetIds => {
      console.log('Deleting', deletedAssetIds.length, 'asset(s)');
      var actions = deletedAssetIds.map(deletedAssetId => {
        return {delete: {_id: deletedAssetId}};
      });
      if (actions.length > 0) {
        return es.bulk({
          index: state.context.index,
          type: 'asset',
          body: actions
        });
      }
    }).then(function() {
      return state;
    });
  } else {
    console.log('Removed assets gets deleted only in "all", "catalog" or ' +
                '"single" mode.');
    return state;
  }
};
