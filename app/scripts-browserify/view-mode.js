$('body').addClass('is-initial-view');

var mobilecheck = function() {
  if ($(window).width() < 768) {
    return true;
  }
  return false;
};

$(window).on('resize load ready', function() {
  $('body').removeClass('is-mobile is-desktop');
  if (mobilecheck() === true) {
    $('body').addClass('is-mobile');
  }
  else {
    $('body').addClass('is-desktop');
  }
});

$('.view-mode').on('click', '[data-action="show-view-list"]', function() {
  var $viewModes = $(this).parent('.view-mode');
  $viewModes.find('.filterbar__tab').removeClass('filterbar__tab--active');
  $('body').removeClass('is-map-view').addClass('is-list-view');
  $(this).find('.filterbar__tab').addClass('filterbar__tab--active');
});

$('.view-mode').on('click', '[data-action="show-view-map"]', function() {
  var $viewModes = $(this).parent('.view-mode');
  $viewModes.find('.filterbar__tab').removeClass('filterbar__tab--active');
  $('body').removeClass('is-list-view').addClass('is-map-view');
  $(this).find('.filterbar__tab').addClass('filterbar__tab--active');
});
