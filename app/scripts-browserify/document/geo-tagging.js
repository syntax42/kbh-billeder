'use strict';
/**
 * Injects a map into each .geo-tagging-mini-map div.
 */
$(function ($) {
  const _ = require('lodash');
  const START_GEO_TAGGING_SELECTOR = '[data-action="geo-tagging:start"]';
  const STOP_GEOTAGGING_SELECTOR = '[data-action="geo-tagging:stop"]';
  const SAVE_GEO_TAG_SELECTOR = '[data-action="save-geo-tag"]';
  const controllerState = {
    assetBackup: undefined,
    saving: false
  }

  function _initializeMap (mapElement) {
    // Extract asset meta-data from the div.
    const $mapElement = $(mapElement);
    const asset = {
      latitude: $mapElement.data('latitude'),
      longitude: $mapElement.data('longitude'),
      approximate: $mapElement.data('approximate')
    };

    // Only add heading to the asset object if we actually have one.
    if ($mapElement.data('heading') &&$mapElement.data('heading') !== 'null') {
      asset.heading = $mapElement.data('heading');
    }

    // Instantiate a map controller and load it up
    const MapController = require('map-controller');
    const options = {
      mode: 'single',
      initialZoomLevel: 18,
      initialCenter: [asset.longitude, asset.latitude]
    };

    // Push the marker a bit to the right if we're on desktop.
    if (!window.helpers.isMobile($)) {
      options.initialOffset = [250, 0];
    }

    // We currently don't have any callbacks for a single-mode map, so pass an
    // empty callback object.
    var callBacks = {};
    var mapController = MapController(mapElement, callBacks, options);

    // Have the map display the asset.
    mapController.onSingleResult(asset);
    mapController.onSingleResult(asset);
    return mapController;
  }

  // Hide the edit button and show save/cancel.
  function _setStateEdit () {
    $(START_GEO_TAGGING_SELECTOR).hide();
    $(STOP_GEOTAGGING_SELECTOR).show();
    $(SAVE_GEO_TAG_SELECTOR).show();
  }

  // Hide the save/cancel button and show edit.
  function _setStateView () {
    $(START_GEO_TAGGING_SELECTOR).show();
    $(STOP_GEOTAGGING_SELECTOR).hide();
    $(SAVE_GEO_TAG_SELECTOR).hide();
  }

  function _registerListeners (mapController) {
    // The user clicked "edit".
    $(document).on('click', START_GEO_TAGGING_SELECTOR, () => {
      // Toggle edit mode and get the live asset
      var liveAsset = mapController.toggleEditMode(true);

      // Clone the asset so we have something to return to if the user bails
      // out.
      controllerState.assetBackup = JSON.parse(JSON.stringify(liveAsset));

      // Set button state.
      _setStateEdit();
    });

    // The user clicked "cancel".
    $(document).on('click', STOP_GEOTAGGING_SELECTOR, () => {
      // Switch the map back to single mode.
      mapController.toggleEditMode(false);

      // Restore the original asset.
      mapController.onSingleResult(controllerState.assetBackup);

      // Set button state.
      _setStateView();
    });

    // The user clicked "save".
    $(document).on('click', SAVE_GEO_TAG_SELECTOR, () => {
      // Protect us against multiple clicks.
      if (controllerState.saving) {
        console.log('Already saving');
        return;
      }

      var liveAsset = mapController.toggleEditMode(false);

      // Don't store anything if the user did not make any changes.
      // If the location was approximate and the user clicks save we take it as
      // a confirmation of the location and go ahead with the save.
      if (_.isEqual(liveAsset, controllerState.assetBackup) && !liveAsset.approximate) {
        _setStateView();
        return;
      }

      controllerState.saving = true;

      var saveObject = {
        latitude: liveAsset.latitude,
        longitude: liveAsset.longitude
      };

      // Only include heading if the user specified one.
      if (liveAsset.heading || liveAsset.heading === 0) {
        saveObject.heading = liveAsset.heading;
      }

      const saveGeotagUrl = location.pathname + '/save-geotag';
      $.post(saveGeotagUrl, saveObject, () => {
        // We're done saving, lift the protection and reload the page.
        controllerState.saving = false;
        window.location.reload();
      }, 'json');

      _setStateView();
    });
  }

  $('.geo-tagging-mini-map').each(function (index, mapElement) {
    var mapController = _initializeMap(mapElement);
    _registerListeners(mapController);
  });
});
