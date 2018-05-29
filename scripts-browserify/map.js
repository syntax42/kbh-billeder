var Map = {
  init: function (items) {
    let map;

    const copenhagen = {
      lat: 55.6761,
      lng: 12.5683
    };

    map = new google.maps.Map(document.getElementById('map'), {
      center: copenhagen,
      zoom: 12
    });

    let iconPath = '../images/icons/map/';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        var currentLocationMarker = new google.maps.Marker({
          position: currentLocation,
          title: 'Din placering',
          animation: google.maps.Animation.DROP,
          icon: iconPath + 'currentLocation.png'
        });
        currentLocationMarker.setMap(map);

        map.setCenter(currentLocation);
      });
    }

    let markers = items.map(function(item) {
      var colid = item.collection + '/' + item.id;
      var boxText = document.createElement('div');

      boxText.innerHTML = '<a href="/' + colid + '"><img src="/' + colid + '/thumbnail" width="220px" height="220px" /><h1>' + item.short_title + '</h1></a>';

      var myOptions = {
        content: boxText,
        maxWidth: 220,
        zIndex: null,
        closeBoxURL: '',
        alignBottom: true,
        pixelOffset: new google.maps.Size(-110, -40),
      };

      var marker = new google.maps.Marker({
        position: { lat: item.latitude, lng: item.longitude },
        title: item.short_title,
        animation: google.maps.Animation.DROP,
        icon: iconPath + 'pin.png',
        item: item,
        infobox: new InfoBox(myOptions),
      });

      return marker;
    });

    markers.forEach(marker => {
      marker.addListener('click', function() {
        var currentMarker =  this;
        $.each(markers, function(i, marker) {
          if(marker !== currentMarker) {
            marker.infobox.close();
          }
        });

        marker.infobox.open(map, marker);
      });
    });

    let textColor = '#E32166';

    let options = {
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

    return new MarkerClusterer(map, markers, options);
  }
};

module.exports = Map;