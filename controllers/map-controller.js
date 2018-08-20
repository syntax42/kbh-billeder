'use strict';

function _mapResultsToAssets(results) {
  // TODO, map from results to assets.

  return results;
}

/**
 * The MapController handles the integration between a map provider and kbhbilleder.
 *
 * The Controller is allowed to use knowledge about kbh billeder (ie. it has
 * access to a search provider), and knows how to handle the concrete map provider
 * implementation. It can not know anything about the internals of the map
 * provider.
 *
 * All interaction between the map controller and the map provider must happen
 * via public api calls.
 *
 * Should we want to support multiple map providers this controller could be
 * made more general, for now it assumes we're integrating with historisk atlas.
 *
 * @param mapElement
 * @param icons
 * @param searchController
 * @constructor
 */
function MapController (mapElement, searchController) {
  var onMoveStart = function (mapHandler) {
    mapHandler.clear();
  };

  var onMoveEnd = function (mapHandler) {
    // pull the nessecary state from the map and prepare search options.
    var params = searchController.getCurrentSearchParameters();
    // Trigger a new search, well get the results via the onUpdate callback.
    searchController.search(params);
  };

  var onPopupClick = function (id) {
    console.log("popup click with id: " + id);
  }

  var icons = {
    clusterSmall: '/app/images/icons/map/m1.png',
    clusterMedium: '/app/images/icons/map/m2.png',
    clusterLarge: '/app/images/icons/map/m3.png',
    asset: '/app/images/icons/map/pin.png',
    assetHeading: '/app/images/icons/map/pinheading.png'
  };

  //create and init map object
  var mapHandler = HistoriskAtlas(
    mapElement,
    {
      center: [12.8, 55.67],
      zoomLevel: 10,
      clusterAtZoomLevel: 11,
      onMoveStart: onMoveStart,
      onMoveEnd: onMoveEnd,
      onPopupClick: onPopupClick,
      icons
    }
  );

  // Return callbacks.
  return {
    // Invoked if the search-controller is modified by someone.
    onUpdate: function() {
      // TODO - should we get the search controller or a "handler" as param?
      var results = searchController.getCurrentResults()
      var assets = _mapResultsToAssets(results);
      mapHandler.show(assets);
    }
  };
}

module.exports = MapController;
