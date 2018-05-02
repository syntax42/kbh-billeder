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

    let markers = items.map(function(item) {
      return new google.maps.Marker({
        position: { lat: item.latitude, lng: item.longitude },
        title: item.short_title,
        animation: google.maps.Animation.DROP,
        icon: iconPath + 'pin.png'
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
    let markerCluster = new MarkerClusterer(map, markers, options);
  }
};

module.exports = Map;