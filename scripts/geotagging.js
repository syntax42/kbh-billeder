var resizeMap;
var map;
var marker;
var address;

(function($) {
  // Let's define a global function, to be called when initializing or when
  // the window resizes.
  resizeMap = function() {
    var assetImgHeight = $('.primary-asset img').height();
    $('#geotagging-map').height(assetImgHeight);
    google.maps.event.trigger(map, 'resize');
  }

  var showError = function(msg) {
    $error = $('<div class="alert alert-danger">');
    $error.text(msg);
    $('.geotagging').append($error);
  };

  $('.call-to-action .btn').click(function() {
    $(this).hide();
    if(!window.localStorage.getItem('geotagging-overlay-closed')) {
      $('.geotagging .overlay').show();
    }
    $('.map-container').slideDown('slow', function() {
      // resize google map to match asset image on click and on window resize
      $( window ).bind('resize', resizeMap).trigger('resize');
      map.setCenter(marker.getPosition());
    });
  });

  $('.map-buttons .hide-map').click(function() {
    $('.map-container').slideUp('slow', function() {
      $('.call-to-action .btn').show();
      $( window ).unbind('resize', resizeMap);
    });
  });

  $('.overlay .close-overlay').click(function() {
    window.localStorage.setItem('geotagging-overlay-closed', true);
    $('.geotagging .overlay').hide();
  });

  $('.map-buttons .save-coordinates').click(function() {
    $(this).addClass('disabled');
    var data = {
      force: location.search.indexOf('forceGeotagging') !== -1
    };
    if(map.getStreetView().getVisible()){
      data.latitude = map.getStreetView().getPosition().lat();
      data.longitude = map.getStreetView().getPosition().lng();
      data.pov = map.getStreetView().getPov();
    } else{
      data.latitude = marker.getPosition().lat();
      data.longitude = marker.getPosition().lng();
    }
    var $item = $('.item');
    var catalogAlias = $item.data('catalog-alias');
    var itemId = $item.data('item-id');
    console.log('Saving geo-tag', catalogAlias, itemId, data);
    var url = '/' + catalogAlias + '/' + itemId + '/save-geotag';
    $.ajax({
      type: 'post',
      url: url,
      data: data,
      dataType: 'json',
      success: function(response) {
        if(response.success) {
          location.reload();
        } else {
          showError('Der skete en fejl - prøv igen');
        }
      },
      error: function(response) {
        var err = response.responseJSON;
        showError(err.message || 'Der skete en uventet fejl.');
      }
    });
  });
})(jQuery);

function initMap() {
  var initialPosition = new google.maps.LatLng(55.6747, 12.5747); // The National Museums coordinates
  var address = $('#address').text();

  geocoder = new google.maps.Geocoder();

  geocoder.geocode({ 'address': address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var geocodeLocation = results[0].geometry.location;
        var geocodeLatLng = new google.maps.LatLng(geocodeLocation.lat(), geocodeLocation.lng());

        map.setCenter(geocodeLatLng);
        marker.setPosition(geocodeLatLng);
        google.maps.event.trigger(map, 'resize');
      }
  });

  map = new google.maps.Map(document.getElementById('geotagging-map'), {
    center: initialPosition,
    zoom: 12
  });

  marker = new google.maps.Marker({
    position: initialPosition,
    map: map,
    draggable:true
  });

  google.maps.event.addListener(map, 'click', function(event) {
    marker.setPosition(event.latLng);
  });

  resizeMap();
}
