var Map = {
  // Start the map off over Copenhagen.
  center: {
    lat: 55.6761,
    lng: 12.5683
  },
  zoomLevel: 12,

  // Reference to the google.maps.Map instance created in init().
  googleMap: false,

  // Whether the map has been initialized and has stopped sending events that
  // indicates the user is interacting with it.
  mapIsIdle: false,

  // Reference to current set of markers.
  clusteredMarkers: undefined,

  /**
   * Returns an Elastic Search {top_left, bottom_right} bounds object.
   */
  getEsBounds: function() {
    if (this.googleMap && this.googleMap.getBounds()) {
      let ne = this.googleMap.getBounds().getNorthEast();
      let sw = this.googleMap.getBounds().getSouthWest();

      // Google maps gives us NE/SW coordinate, Elasticsearch wants a NW/SE, so
      // we have to reorder the coordinates before using them.
      return {
        'top_left': {
          'lat': ne.lat(),
          'lon': sw.lng()
        },
        'bottom_right': {
          'lat': sw.lat(),
          'lon': ne.lng()
        }
      };
    } else {
      return false;
    }
  },

  /**
   * Write the state of the map out into public properties.
   *
   * When used as a callback the map is passed in so that we use a correct
   * reference instead of this.
   */
  sync: function(updateSearch, map = this) {
    map.zoomLevel = map.googleMap.getZoom();
    map.center = map.googleMap.getCenter();

    // Indicate that the map is being updated.
    map.mapIsIdle = false;
    updateSearch(true, true);
  },

  /**
   * Update an initialized map based on an array of search result items.
   *
   * The items must have one of the following structures
   *
   * {type: "hash", location: {lat: ..., lon: ...}, count: ...}
   *
   * {type: "asset", location: {lat: ..., lon: ...}, assetData: ....}
   *
   * @param items
   */
  update: function(items) {
    let iconPath = '../images/icons/map/';
    if (items.length === 0) {
      return;
    }

    let itemType = items[0].type;

    let markers = items.map(function(item) {
      if (!item.location || !item.location.lat || !item.location.lon) {
        // Skip items without location.
        return;
      }

      // Set the properties the markers share.
      let markerData = {
        position: {lat: item.location.lat, lng: item.location.lon}
      };

      // Hash markers are all going to be aggregated so all we need to inject
      // is a count.
      if(item.type === 'hash') {
        markerData.subCount = item.count;
      } else if (item.type === 'asset') {
        var colid = item.assetData.collection + '/' + item.assetData.id;
        var boxText = document.createElement('div');

        boxText.innerHTML = '<a href="/' + colid + '"><img data-src="/' + colid + '/thumbnail" width="220px" height="220px" /><h1>' + item.assetData.short_title + '</h1></a>';

        var infoboxConfiguration = {
          content: boxText,
          maxWidth: 220,
          zIndex: null,
          closeBoxURL: '',
          alignBottom: true,
          pixelOffset: new google.maps.Size(-110, -40),
        };

        markerData.title = item.assetData.short_title;
        markerData.icon = iconPath + 'pin.png';
        markerData.infobox = new InfoBox(infoboxConfiguration);
      }

      return new google.maps.Marker(markerData);
    });

    // Filter away markers without location.
    markers = markers.filter(Boolean);

    if (itemType === 'asset') {
      let googleMapReference = this.googleMap;
      markers.forEach(marker => {
        marker.addListener('mousedown', function() {
          var currentMarker = this;
          $.each(markers, function(i, marker) {
            if(marker !== currentMarker) {
              marker.infobox.close();
            }
          });

          marker.infobox.open(googleMapReference, marker);
          [].forEach.call(marker.infobox.content_.querySelectorAll('img[data-src]'), function(img) {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.onload = function() {
              img.removeAttribute('data-src');
            };
          });
        });
      });
    }

    let textColor = '#E32166';

    // Set up the icons for the clustering.
    // Only allow the clusterer to reval the individual markers if they are not
    // hashes.
    let options = {
      minimumClusterSize: itemType === 'hash' ? 1 : 5,
      styles: [
        {
          textColor: textColor,
          url: iconPath + 'm1.png',
          height: 48,
          width: 48
        },
        {
          textColor: textColor,
          url: iconPath + 'm2.png',
          height: 56,
          width: 56
        },
        {
          textColor: textColor,
          url: iconPath + 'm3.png',
          height: 64,
          width: 64
        },
      ],
    };

    if (this.clusteredMarkers) {
      this.clusteredMarkers.clearMarkers();
    }
    this.clusteredMarkers = new MarkerClusterer(this.googleMap, markers, options);
    // We've completed our update and we can start listening for changes again.
    this.mapIsIdle = true;
  },

  init: function (updateSearch, center = this.center, zoom = this.zoomLevel) {
    this.googleMap = new google.maps.Map(document.getElementById('map'), {
      // Center the map on copenhagen.
      center: center,
      zoom: zoom,
      // Don't require the user to use two fingers when scrolling.
      gestureHandling: 'greedy'
    });
    // Setup variables for the closure.
    let timer;
    let mapIsIdle = this.mapIsIdle;
    let sync = this.sync;
    let syncMapRefernce = this;
    google.maps.event.addListener(this.googleMap, 'bounds_changed', function() {
      // Only act on change events if the map was previously reported idle.
      if (mapIsIdle) {
        clearTimeout(timer);
        timer = setTimeout(function(){sync(updateSearch, syncMapRefernce);}, 500);
      }
    });

    google.maps.event.addListenerOnce(this.googleMap, 'idle', function(){
      // The map has settled down and we're ready to react on new changes.
      mapIsIdle = true;
    });

    // TODO - make this work
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        let iconPath = '../images/icons/map/';
        var currentLocationMarker = new google.maps.Marker({
          position: currentLocation,
          title: 'Din placering',
          animation: google.maps.Animation.DROP,
          icon: iconPath + 'currentLocation.png'
        });
        currentLocationMarker.setMap(this.googleMap);

        this.googleMap.setCenter(currentLocation);
      });
    }
  }
};

module.exports = Map;
