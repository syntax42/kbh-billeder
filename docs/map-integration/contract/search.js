'use strict';

//MapController for demo purpose
var MC = (function () {

  function MC () {
    var onMoveStart = function (mapHandler) {
      console.log("move start");
      mapHandler.clear();
    };

    var onMoveEnd = function (mapHandler) {
      console.log("move end");
      console.log("New center");
      console.log(mapHandler.getCenter());
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'search-asset-list.json', true);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xhr.onload = function (e) {
        console.log("Showing");
        mapHandler.show(JSON.parse(xhr.responseText));
      };
      xhr.send(null);

    };

    var onPopupClick = function (id) {
      console.log("popup click with id: " + id);
    }

    //create and init map object
    this.map = Map(
      document.getElementById('map'),
      {
        center: [12.8, 55.67],
        zoomLevel: 10,
        clusterAtZoomLevel: 11,
        onMoveStart: onMoveStart,
        onMoveEnd: onMoveEnd,
        onPopupClick: onPopupClick,
        icons: {
          clusterSmall: '/app/images/icons/map/m1.png',
          clusterMedium: '/app/images/icons/map/m2.png',
          clusterLarge: '/app/images/icons/map/m3.png',
          asset: '/app/images/icons/map/pin.png'
        }
      }
    );
  }

  //called by the map when a refresh of the assets is required
  MC.prototype.refresh = function () { //TODO, still needed or replaced by "onMoveEnd"?
    var _this = this;

    //STATIC demonstration
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'search-asset-list.json', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = function (e) {
      _this.map.show(JSON.parse(xhr.responseText));
    };
    xhr.send(null);

    ////DYNAMIC demonstration (using kbhbilleder.dk/api)
    //var xhr = new XMLHttpRequest();
    //xhr.open("POST",
    // "https://kbhbilleder.dk/api/_search?size=0&_source=location%2Clongitude%2Clatitude%2Ccollection%2Cid%2Cshort_title%2Ctype",
    // true); xhr.setRequestHeader('Content-Type', 'application/json')
    // xhr.onload = function (e) { var data = JSON.parse(xhr.responseText); var
    // assets = []; for (var i = 0, buckets =
    // data.aggregations.geohash_grid.buckets; i < buckets.length; i++) { var
    // bucket = buckets[i]; var coordinates =
    // _this.getCoordinateFromGeohash(bucket.key); assets.push({ "latitude":
    // coordinates.latitude, "longitude": coordinates.longitude, "clustered":
    // true, "count": bucket.doc_count }) }

    //    _this.map.show(assets);
    //    //console.log(JSON.stringify(assets))

    //}
    //xhr.send(JSON.stringify({ "query": { "boosting": { "positive": { "bool":
    // { "must": [{ "bool": { "must_not": { "term": {
    // "related.assets.direction": "parent" } } } }, { "bool": { "should": [{
    // "bool": { "should": [{ "exists": { "field": "google_maps_coordinates" }
    // }, { "exists": { "field": "google_maps_coordinates_crowd" } }] } }] } },
    // { "geo_bounding_box": { "location": { "top_left": { "lat":
    // 55.72572422597386, "lon": 12.442300549316428 }, "bottom_right": { "lat":
    // 55.642304025872946, "lon": 12.727773419189475 } } } }] } }, "negative":
    // { "query_string": { "default_operator": "OR", "default_field":
    // "tags_vision", "query": "" } }, "negative_boost": 0.5 } }, "sort":
    // "_score", "aggregations": { "geohash_grid": { "geohash_grid": { "field": "location", "precision": 6 } } } }));

  };

  //MC.prototype.getCoordinateFromGeohash = function(geohash) {
  //    var bounds = this.getBoundsFromGeohash(geohash);

  //    var latMin = bounds.sw.lat, lonMin = bounds.sw.lon;
  //    var latMax = bounds.ne.lat, lonMax = bounds.ne.lon;

  //    var lat = (latMin + latMax) / 2;
  //    var lon = (lonMin + lonMax) / 2;

  //    lat = lat.toFixed(Math.floor(2 - Math.log(latMax - latMin) /
  // Math.LN10)); lon = lon.toFixed(Math.floor(2 - Math.log(lonMax - lonMin) /
  // Math.LN10));

  //    return { latitude: Number(lat), longitude: Number(lon) };
  //}

  //MC.prototype.getBoundsFromGeohash = function(geohash) {
  //    if (geohash.length === 0) throw new Error('Invalid geohash');

  //    geohash = geohash.toLowerCase();

  //    var evenBit = true;
  //    var latMin =  -90, latMax =  90;
  //    var lonMin = -180, lonMax = 180;

  //    for (var i=0; i<geohash.length; i++) {
  //        var chr = geohash.charAt(i);
  //        var idx = '0123456789bcdefghjkmnpqrstuvwxyz'.indexOf(chr);
  //        if (idx == -1) throw new Error('Invalid geohash');

  //        for (var n=4; n>=0; n--) {
  //            var bitN = idx >> n & 1;
  //            if (evenBit) {
  //                // longitude
  //                var lonMid = (lonMin+lonMax) / 2;
  //                if (bitN == 1) {
  //                    lonMin = lonMid;
  //                } else {
  //                    lonMax = lonMid;
  //                }
  //            } else {
  //                // latitude
  //                var latMid = (latMin+latMax) / 2;
  //                if (bitN == 1) {
  //                    latMin = latMid;
  //                } else {
  //                    latMax = latMid;
  //                }
  //            }
  //            evenBit = !evenBit;
  //        }
  //    }

  //    var bounds = {
  //        sw: { lat: latMin, lon: lonMin },
  //        ne: { lat: latMax, lon: lonMax },
  //    };

  //    return bounds;
  //}

  return MC;
}());

window.onload = function () {
  //create and init map controller object
  var mc = new MC();
};
