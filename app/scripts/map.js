'use strict';

/**
 * Read in options and set defaults.
 */
function _prepareMapOptions (options) {
  if (!options) {
    options = {};
  }

  if (!options.center) {
    options.center = [12.58, 55.67];
  }

  if (!options.zoomLevel) {
    options.zoomLevel = 12;
  }

  if (!options.clusterAtZoomLevel) {
    options.clusterAtZoomLevel = 11;
  }

  if (!options.onMoveStart) {
    options.onMoveStart = function () {};
  }

  if (!options.onMoveStart) {
    options.onMoveEnd = function () {};
  }

  if (!options.onPopupClick) {
    options.onPopupClick = function (id) { };
  }

  return options;
}

/**
 * Setup a map instance and wrap it in an object containing references to
 * everything we'll need to handle the map going forward.
 */
function _prepareMap (mapElement, center, zoomLevel, icons) {
  // Collect any map-related objects we're going to be referencing in the rest
  // of the setup and in callbacks.
  var mapState = {};

  mapState.mapElement = mapElement;

  mapState.vectorSource = new ol.source.Vector({
    features: []
  });

  mapState.clusterSource = new ol.source.Cluster({
    distance: 70,
    source: mapState.vectorSource
  });

  var styleCache = {};
  var featureIcons = [, icons.clusterSmall, icons.clusterMedium, icons.clusterLarge];

  // TODO, consider if we can get ol injected to make it easier to eg. test.
  mapState.vectorLayer = new ol.layer.Vector({
    source: mapState.clusterSource,
    updateWhileInteracting: true,
    updateWhileAnimating: true,
    style: function (feature) {
      var subFeatures = feature.get('features');
      if (!subFeatures)
        subFeatures = [feature];

      if (subFeatures.length == 1)
        if (!subFeatures[0].asset.clustered)
          return subFeatures[0].getStyle();

      var count = 0;
      for (var i = 0; i < subFeatures.length; i++) {
        count += subFeatures[i].asset.count;
      }
      var style = styleCache[count];
      if (!style) {
        style = new ol.style.Style({
          image: new ol.style.Icon({
            src: featureIcons[Math.min(count.toString().length, 3)]
          }),
          text: new ol.style.Text({
            text: count.toString(),
            font: '11px Arial, sans-serif',
            fill: new ol.style.Fill({
              color: '#e32166'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 3
            })
          })
        });
        styleCache[count] = style;
      }
      return style;
    }
  });

  mapState.view = new ol.View({
    center: ol.proj.fromLonLat(center),
    zoom: zoomLevel
  });

  var rasterLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://tile.historiskatlas.dk/tile/a2JoYmlsbG/161/{z}/{x}/{y}.jpg'
    })
  });

  mapState.map = new ol.Map({
    target: mapElement,
    layers: [rasterLayer, mapState.vectorLayer],
    view: mapState.view,
    controls: [],
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
  });

  //Create popup
  mapElement.insertAdjacentHTML('afterend', '<div id="mapPopup"><div id="mapPopupImage"></div><h1 id="mapPopupHeading"></h1></div>');
  mapState.mapPopupElement = document.getElementById('mapPopup');

  return mapState;
}

/**
 * Integration between kbhbilleder and a map-provider.
 */
function Map(mapElement, options) {
  // Clean up our options.
  options = _prepareMapOptions(options);

  // Then prepare the map for use and get a state object we can use to interact
  // with the map.
  var mapState = _prepareMap(mapElement, options.center, options.zoomLevel, options.icons);

  // Setup handler functions the client will use to interact with the map - ie.
  // we never expose the mapState to the user, only handler functions.
  var mapHandler = {};

  // TODO: Document handler functions, and deside whether "handler" is the
  // best name.
  mapHandler.show = function (assets) {
    mapState.vectorSource.clear(true);
    var features = [];
    for (var i = 0; i < assets.length; i++) {
      var asset = assets[i];
      var feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([asset.longitude, asset.latitude]))
      });
      if (!asset.clustered)
        feature.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            src: options.icons.asset
          })
        }));
      feature.asset = asset;
      features.push(feature);
    }
    mapState.vectorSource.addFeatures(features);
  };

  mapHandler.getBoundingBox = function () {
    var extent = mapState.view.calculateExtent();
    var topLeft = ol.proj.toLonLat(ol.extent.getTopLeft(extent));
    var bottomRight = ol.proj.toLonLat(ol.extent.getBottomRight(extent));
    return {
      topLeft: {
        longitude: topLeft[0],
        latitude: topLeft[1]
      },
      bottomRight: {
        longitude: bottomRight[0],
        latitude: bottomRight[1]
      }
    };
  };

  mapHandler.getCenter = function () {
    var center = ol.proj.toLonLat(mapState.view.getCenter());
    return {
      longitude: center[0],
      latitude: center[1]
    };
  };

  mapHandler.clear = function () {
    mapState.vectorSource.clear(true);
  };

  mapHandler.getZoomLevel = function () {
    return mapState.view.getZoom();
  };

  // Event handling - integrate the clients event handlers.
  mapState.map.on('movestart', function (event) {
    mapState.mapPopupElement.style.display = 'none';
    options.onMoveStart(mapHandler);
  });
  mapState.map.on('moveend', function (event) {
    
    //if (options.clusterAtZoomLevel < mapState.view.getZoom())
    mapState.vectorLayer.setSource(options.clusterAtZoomLevel < mapState.view.getZoom() ? mapState.vectorSource : mapState.clusterSource);

    options.onMoveEnd(mapHandler);
  });

  mapState.map.on('pointermove', function (event) {
    var hoverFeature;
    mapState.map.forEachFeatureAtPixel(mapState.map.getEventPixel(event.originalEvent), function (feature) { hoverFeature = feature; return true; });
    mapState.mapElement.style.cursor = hoverFeature ? 'pointer' : '';
  })

  mapState.map.on('click', function (event) {
    var clickFeature;
    mapState.map.forEachFeatureAtPixel(mapState.map.getEventPixel(event.originalEvent), function (feature) { clickFeature = feature; return true; });

    mapState.mapPopupElement.style.display = 'none';

    if (!clickFeature)
      return;

    var subFeatures = clickFeature.get('features');
    if (!subFeatures)
      subFeatures = [clickFeature];

    var asset = subFeatures[0].asset;

    if (subFeatures.length == 1 && !asset.clustered) {
      var pixel = mapState.map.getPixelFromCoordinate(clickFeature.getGeometry().getCoordinates());
      mapState.mapPopupElement.style.left = (pixel[0] - 110) + 'px';
      mapState.mapPopupElement.style.top = (pixel[1] - 315) + 'px';
      document.getElementById('mapPopupImage').style.backgroundImage = "url('" + asset.image_url + "')";
      document.getElementById('mapPopupHeading').innerText = asset.short_title;
      mapState.mapPopupElement.style.display = 'block';
      mapState.mapPopupElement.assetId = asset.id;
      return;
    }

    mapState.view.animate({
      center: clickFeature.getGeometry().getCoordinates(),
      duration: 1000,
      zoom: mapState.view.getZoom() + 2
    });
  })

  mapState.mapPopupElement.addEventListener('click', function () {
    options.onPopupClick(mapState.mapPopupElement.assetId);
  })

  return mapHandler;
};

// TODO - integrate into the site.
// module.exports = Map;
