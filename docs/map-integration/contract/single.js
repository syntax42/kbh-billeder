'use strict';

//MapController for demo purpose
var MC = (function () {

  function MC () {

    //create and init map object
    var ha = HistoriskAtlas(
      document.getElementById('map'),
      {
        mode: 'single',
        center: [12.35760, 55.71490],
        zoomLevel: 16,
        icons: {
          asset: '/app/images/icons/map/pin.png',
          assetHeading: '/app/images/icons/map/pinheading.png'
        }
      }
    );

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'asset-single-asset.json', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = function (e) {
      console.log("Showing");
      ha.show([JSON.parse(xhr.responseText)]);
    };
    xhr.send(null);
  }

  return MC;
}());

window.onload = function () {
  //create and init map controller object
  var mc = new MC();
};
