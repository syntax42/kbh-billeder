$('body').addClass('is-initial-view');

var mobilecheck = function() {
  if ($(window).width() < 768) {
    return true;
  }
  return false;
};

var viewMode = 'map';

$(window).on('resize load ready', function() {
  $('body').removeClass('is-mobile is-desktop');
  if (mobilecheck() === true) {
    if (viewMode === 'map') {
      $('body').addClass('is-mobile is-mobile-map-view is-map-view');
    }
    if (viewMode === 'list') {
      $('body').addClass('is-mobile is-list-view').removeClass('is-mobile-map-view is-map-view');
    }
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

$('.filterbar--mobile__container').on('click', '[data-action="show-view-list"]', function() {
  $('body').removeClass('is-mobile-map-view is-map-view').addClass('is-list-view');
  viewMode = 'list';
});

$('.view-mode').on('click', '[data-action="show-view-map"]', function() {
  var $viewModes = $(this).parent('.view-mode');
  $viewModes.find('.filterbar__tab').removeClass('filterbar__tab--active');
  $('body').removeClass('is-list-view').addClass('is-map-view');
  $(this).find('.filterbar__tab').addClass('filterbar__tab--active');
});
