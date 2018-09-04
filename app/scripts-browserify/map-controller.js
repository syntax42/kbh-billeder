﻿'use strict';

/**
 * Clean up results from Elastic Search and map them to Asset results
 *
 * @param results
 *   List of elastic search results
 * @param searchParameters
 *   The parameters that resulted in the search results.
 * @returns list of Assets
 * @private
 */
function _mapEsResultsToAssets(results, searchParameters) {
  let assets = [];
  // If the results are aggregated geo-hashes, produce assets with hashes.
  if (searchParameters.geohash) {
    results.aggregations.geohash_grid.buckets.forEach(function(hashBucket) {
      let count = hashBucket.doc_count;
      assets.push({
        geohash: hashBucket.key,
        clustered: true,
        count: count,
      });
    });
  } else {
    // We're looking at a result-set with full assets.
    results.hits.hits.forEach(function(hit) {

      var asset = hit._source;
      var colid = `${asset.collection}/${asset.id}`;

      var assetResult = {
        id: colid,
        short_title: asset.short_title,
        description: '',
        image_url: `${colid}/thumbnail`,
        latitude: asset.location.lat,
        longitude: asset.location.lon,
        clustered: false,
        // We keep the count property to make upstream handling easier.
        count: 1
      };

      // Heading is optional, so only add it if we have one.
      if (asset.heading) {
        assetResult.heading = asset.heading;
      }

      assets.push(assetResult);
    });
  }

  return assets;
}

/**
 * The MapController handles the integration between a map provider and
 * kbhbilleder.
 *
 * The Controller is allowed to use knowledge about kbh billeder (ie. it has
 * access to a search provider), and knows how to handle the concrete map
 * provider implementation. It can not know anything about the internals of the
 * map provider.
 *
 * All interaction between the map controller and the map provider must happen
 * via public api calls.
 *
 * Should we want to support multiple map providers this controller could be
 * made more general, for now it assumes we're integrating with historisk
 * atlas.
 *
 * @param mapElement
 *   DOM-element the map should be attached to
 *
 * @param searchControllerCallbacks
 *   Callback object the map-controller can use to access the search controller.
 *
 * @param options
 *   Optional options object
 *   - icons: List of icon assets
 *   - geohashAtZoomLevel: the zoom-level at which we should be hashing search
 *     results
 *   - clusterAtZoomLevel: the zoom-level at which frontend placemark-clustering
 *     should be enabled
 *   - assetMapper: function that maps raw search-results to assets
 *   - initialCenter: [lon, lat] array the map should be centered at
 *   - initialZoomLevel: initial zoom-level for the map
 *
 * @constructor
 */
function MapController (mapElement, searchControllerCallbacks, options) {
  var initialized = false;
  var defaultMapHandler;
  var assetMapper;

  /**
   * Initialize the Map
   *
   * To support instansiating the MapController without loading the map into
   * the dom we have an explicit initialization step.
   *
   * @private
   */
  function _initializeMap() {
    if (initialized) {
      return;
    }

    // Options are default, so populate any missing settings with defaults.
    if (!options) {
      options = {};
    }

    if (!options.icons) {
      options.icons = {
        clusterSmall: '../images/icons/map/m1.png',
        clusterMedium: '../images/icons/map/m2.png',
        clusterLarge: '../images/icons/map/m3.png',
        asset: '../images/icons/map/pin.png',
        assetSelected: '../images/icons/map/pinselected.png',
        assetHeading: '../images/icons/map/pinheading.png',
        assetHeadingSelected: '../images/icons/map/pinheadingselected.png',
        assetEdit: '../images/icons/map/pinedit.png',
        assetHeadingEdit: '../images/icons/map/pinheadingedit.png',
        camera: '../images/icons/map/camera.png',
        target: '../images/icons/map/pintarget.png',
        image: '../images/icons/map/image.png'
      };

      // If the user has not given us a specific set of icons, switch to a
      // different set for single assets.
      if (options.mode === 'single') {
        options.icons.asset = '../images/icons/map/pinselected.png';
        options.icons.assetHeading = '../images/icons/map/pinheadingselected.png';
        options.icons.assetEdit = '../images/icons/map/pinedit.png';
        options.icons.assetHeadingEdit = '../images/icons/map/pinheadingedit.png';
      }
    }

    if (options.mapInitParam) {
      // Map state serialized down into a string.
      var parts = options.mapInitParam.split(',');
      // The expected format is nn.nnnnnn,nn.nnnnnn,nnz
      // Eg. 55.67175956237506,12.766296393235555,11.420000000000002z
      // Do a simple verification of the parameters, check that we have 3 parts
      // and that the last part ends on a z.
      if (parts.length === 3 && parts[2].charAt(parts[2].length - 1) === 'z') {
        // Parse the individual parts, and add them if we're successful.
        var parsedCenter = [parseFloat(parts[1]), parseFloat(parts[0])];
        if (!isNaN(parsedCenter[0]) && !isNaN(parsedCenter[1])) {
          options.initialCenter = parsedCenter;
        }
        var parsedZoom = parseFloat(parts[2].substring(0, parts[2].length - 1));
        if (!isNaN(parsedZoom)) {
          options.initialZoomLevel = parsedZoom;
        }
      }
    }
    if (!options.geohashAtZoomLevel) {
      options.geohashAtZoomLevel = 15;
    }

    if (!options.clusterAtZoomLevel) {
      options.clusterAtZoomLevel = 18;
    }

    if (!options.initialCenter) {
      options.initialCenter = [12.8, 55.67];
    }

    if (!options.initialZoomLevel) {
      options.initialZoomLevel = 10;
    }

    if (!options.mode) {
      options.mode = 'search';
    }

    // Allow the client to inset a custom mapper that maps from the search-
    // providers results to assets that can be handled by the map-provider.
    if(options.assetMapper) {
      assetMapper = options.assetMapper;
    } else {
      assetMapper = _mapEsResultsToAssets;
    }

    // Prepare callback functions for the map.

    // Clear the map when the user interacts with it.
    var onMoveStart = function (eventMapHandler) {
      if (options.mode === 'search') {
        eventMapHandler.clear();
      }
    };

    // When the user lets go of the map, trigger a refresh of the search.
    var onMoveEnd = function (eventMapHandler) {
      // Trigger a new search, well get pinged via onUpdate where we'll set our
      // bounding box.
      if (options.mode === 'search') {
        searchControllerCallbacks.refresh();
      }
    };

    // The user has clicked on an asset on the map that needs to be displayed.
    var onPopupClick = function (id) {
      window.location.href = id;
    };

    // Create and init map object.
    defaultMapHandler = HistoriskAtlas(
      mapElement,
      {
        mode: options.mode,
        center: options.initialCenter,
        zoomLevel: options.initialZoomLevel,
        clusterAtZoomLevel: options.clusterAtZoomLevel,
        onMoveStart: onMoveStart,
        onMoveEnd: onMoveEnd,
        onPopupClick: onPopupClick,
        onTimeWarpToggle: options.onTimeWarpToggle,
        icons: options.icons
      }
    );

    // We're now attached to the dom.
    initialized = true;
  }

  // Produce callback object for the caller.
  const handlerCallbacks = {
    /**
     * Plot a single asset on map.
     *
     * Use this function for populating a map with mode=single
     *
     * @param asset
     *   An asset to plot with the properties latitude, longitude,
     *   heading(optional), approximate
     */
    onSingleResult: function (asset) {
      // Make sure we're not working on an uninitialized map.
      _initializeMap();
      defaultMapHandler.show([asset]);
    },

    /**
     * Triggered when new search results are available.
     *
     * The map controller will clear the map, process the search results, and
     * plot them on the map.
     *
     * @param results
     *   List of search results from Elastic Search.
     *
     * @param searchParameters
     *   The parameters that produced the result.
     */
    onResults: function (results, searchParameters) {
      // Make sure we're not working on an uninitialized map.
      _initializeMap();

      // Convert search-results to a list of map-compatible assets.
      var assets = assetMapper(results, searchParameters);

      // Plot the assets on the map.
      defaultMapHandler.show(assets);
    },

    /**
     * Triggered when the search-parameters changes.
     *
     * This will typically be
     * - When trigger it ourselves via onMoveEnd
     * - When the user eg. changes a filter.
     *
     * @param searchParams
     * @param searchCallback
     */
    onUpdate: function (searchParams, searchCallback) {
      // Make sure we're not working on an uninitialized map.
      _initializeMap();

      // Search parameters has been updated and we need to get ready to do a
      // search
      if (!searchParams.filters) {
        searchParams.filters = {};
      }

      // Only show results with location on map.
      searchParams.filters.location = ['Har placering'];

      // Get the current bounding box from the map and add it as a filter.
      let bounds = defaultMapHandler.getBoundingBox();
      if (bounds) {
        let esBounds = {
          'top_left': {
            'lat': bounds.topLeft.latitude,
            'lon': bounds.topLeft.longitude
          },
          'bottom_right': {
            'lat': bounds.bottomRight.latitude,
            'lon': bounds.bottomRight.longitude
          }
        };

        searchParams.filters.geobounds = esBounds;
      }

      // Add centerpoint and zoom-level, this will go into the url.
      const center = defaultMapHandler.getCenter();
      const zoomLevel = defaultMapHandler.getZoomLevel();
      searchParams.map = `${center.latitude},${center.longitude},${zoomLevel}z`;

      // If we're zoomed out wide enough, use hash-based results.
      searchParams.geohash = zoomLevel <= options.geohashAtZoomLevel;

      // Hand the parameters back to the search controller and let it do the the
      // search. We'll get control back via onResults().
      searchCallback(searchParams);
    },
    toggleEditMode: function(editOn) {
      if (options.mode !== 'single') {
        return false;
      }

      return defaultMapHandler.toggleEditMode(editOn);
    },

    toggleTimeWarp: function () {
      defaultMapHandler.toggleTimeWarp();
    },

  };

  // Hand the callbacks back to the Search Controller.
  return handlerCallbacks;
}

module.exports = MapController;
