'use strict';

/**
 * Makes sure that assets that are sub related assets of others are not shown
 * in search results. Filters out the back-side of a lot of photographs.
 */
module.exports = function(state, metadata) {
  // Loop through all related master assets and figure out if one of them has
  // the alternate relation.
  var masterAssets = metadata.related_master_assets || [];
  var hasMasterAlternateAsset = masterAssets.reduce((result, relatedAsset) => {
    return result || relatedAsset.relation === '9ed0887f-40e8-4091-a91c-de356c869251';
  }, false);

  if(hasMasterAlternateAsset) {
    metadata.is_searchable = false;
  }
  // Return the updated metedata.
  return metadata;
};
