'use strict';

const searchController = require('./search');

var mobilecheck = function() {
  if ($(window).width() < 768) {
    return true;
  }
  return false;
};

// Set default view mode to list.
var viewMode = 'list';

$('body').addClass(`is-${viewMode}-view`);

$(window).on('resize load ready', function() {
  $('body').removeClass('is-mobile is-desktop');
  if (mobilecheck() === true) {
    if (viewMode === 'map') {
      $('body').addClass('is-mobile is-map-view').removeClass('is-list-view');
    }
    if (viewMode === 'list') {
      $('body').addClass('is-mobile is-list-view').removeClass('is-map-view');
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

  $('body').trigger('search:viewModeChanged', ['list']);
});

$('.filterbar--mobile__container').on('click', '[data-action="show-view-list"]', function() {
  $('body').removeClass('is-map-view').addClass('is-list-view');
  viewMode = 'list';

  $('body').trigger('search:viewModeChanged', ['list']);
});

$('.filterbar--mobile__container').on('click', '[data-action="show-view-map"]', function() {
  $('body').removeClass('is-list-view').addClass('is-map-view');
  viewMode = 'map';

  $('body').trigger('search:viewModeChanged', ['map']);
});

$('.view-mode').on('click', '[data-action="show-view-map"]', function() {
  var $viewModes = $(this).parent('.view-mode');
  $viewModes.find('.filterbar__tab').removeClass('filterbar__tab--active');
  $('body').removeClass('is-list-view').addClass('is-map-view');
  $(this).find('.filterbar__tab').addClass('filterbar__tab--active');

  $('body').trigger('search:viewModeChanged', ['map']);
});
