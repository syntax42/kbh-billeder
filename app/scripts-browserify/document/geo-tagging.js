'use strict';

/**
 * Injects a map into each .geo-tagging-mini-map div.
 */
$(function($) {

  $('.geo-tagging-mini-map').each(function(index, mapElement) {

    // Extract asset meta-data from the div.
    const $mapElement = $(mapElement);
    const asset = {
      latitude: $mapElement.data('latitude'),
      longitude: $mapElement.data('longitude'),
      heading: $mapElement.data('heading'),
      approximate: $mapElement.data('approximate')
    };

    // Instansiate a map controller and load it up
    const MapController = require('map-controller');
    const options = {
      mode: 'single',
      initialZoomLevel: 18,
      initialCenter: [asset.longitude, asset.latitude]
    };

    // We currently don't have any callbacks for a single-mode map.
    var callBacks = {};
    var mapController = MapController(mapElement, callBacks, options);

    // Have the map display the asset.
    mapController.onSingleResult(asset);
  });
});
