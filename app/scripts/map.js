'use strict';

var Map = (function () {
    var vectorSource;

    //function Map() {
    //}

    Map.prototype.init = function (mapElem, mc, options) {
        var _this = this;

        if (!options)
            options = {};

        if (!options.center)
            options.center = [12.58, 55.67];

        if (!options.zoomLevel)
            options.zoomLevel = 12;

        var rasterLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tile.historiskatlas.dk/tile/a2JoYmlsbG/161/{z}/{x}/{y}.jpg'
            })
        });
        this.vectorSource = new ol.source.Vector({
            features: []
        });
        var clusterSource = new ol.source.Cluster({
            distance: 60,
            source: this.vectorSource
        });
        var styleCache = {};
        var vectorLayer = new ol.layer.Vector({
            source: clusterSource,
            updateWhileInteracting: true,
            updateWhileAnimating: true,
            style: function (feature) {
                var subFeatures = feature.get('features');
                var count = 0;
                for (var i = 0; i < subFeatures.length; i++)
                    count += subFeatures[i].asset.count;
                var style = styleCache[count];
                if (!style) {
                    style = new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 0.5],
                            src: '/app/images/icons/map/m' + Math.min(count.toString().length, 3) + '.png'
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
                    })
                    styleCache[count] = style;
                }
                return style;
            }
        });

        this.view = new ol.View({
            center: ol.proj.fromLonLat(options.center),
            zoom: options.zoomLevel
        })
        var map = new ol.Map({
            target: mapElem,
            layers: [rasterLayer, vectorLayer],
            view: this.view,
            controls: [],
            loadTilesWhileInteracting: true,
            loadTilesWhileAnimating: true
        });

        map.on('movestart', function (evt) {
            _this.vectorSource.clear(true);
        })
        map.on('moveend', function (evt) {
            mc.refresh();
        })

        map.on('pointermove', function (evt) {
            var hoverFeature;
            map.forEachFeatureAtPixel(map.getEventPixel(evt.originalEvent), function (feature) { hoverFeature = feature; return true; });
            mapElem.style.cursor = hoverFeature ? 'pointer' : '';
        })

        map.on('click', function (evt) {
            var clickFeature;
            map.forEachFeatureAtPixel(map.getEventPixel(evt.originalEvent), function (feature) { clickFeature = feature; return true; });

            if (!clickFeature)
                return;

            var subFeatures = clickFeature.get('features');

            if (subFeatures.length == 1 && !subFeatures[0].asset.clustered) {
                alert('clicked one asset'); // TODO...............
                return;
            }

            _this.view.animate({
                center: clickFeature.getGeometry().getCoordinates(),
                duration: 1000,
                zoom: _this.view.getZoom() + 2
            });
        })

        //mc.refresh();
    }

    //API
    Map.prototype.show = function (assets) {

        this.vectorSource.clear(true);
        var features = [];
        for (var i = 0; i < assets.length; i++) {
            var asset = assets[i];
            var feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([asset.longitude, asset.latitude]))
            });
            feature.asset = asset;
            features.push(feature)
        }
        this.vectorSource.addFeatures(features);
    }

    //API
    Map.prototype.getBoundingBox = function () {
        var extent = this.view.calculateExtent();
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
        }
    }

    //API
    Map.prototype.getCenter = function () {
        var center = ol.proj.toLonLat(this.view.getCenter());
        return {
            longitude: center[0],
            latitude: center[1]
        }
    }
    
    //API
    Map.prototype.getZoomLevel = function () {
        return this.view.getZoom();
    }

    return Map;
}());