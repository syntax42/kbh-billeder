'use strict';

const searchController = require('./search');
const helpers = require('../../shared/helpers');

// Set default view mode to list.
var viewMode = 'list';

$('body').addClass(`is-${viewMode}-view`);

$(window).on('resize load ready', function() {
  $('body').removeClass('is-mobile is-desktop');
  if (helpers.isMobile($) === true) {
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

// Desktop.
$('#filterbar .view-mode').on('click', '[data-action="show-view-list"]', function() {
  $('body').trigger('search:viewModeChanged', ['list']);
});
$('#filterbar .view-mode').on('click', '[data-action="show-view-map"]', function() {
  $('body').trigger('search:viewModeChanged', ['map']);
});


// Mobile.
$('#filterbar--mobile .filterbar--mobile__container').on('click', '[data-action="show-view-list"]', function() {
  $('body').trigger('search:viewModeChanged', ['list']);
});
$('#filterbar--mobile .filterbar--mobile__container').on('click', '[data-action="show-view-map"]', function() {
  $('body').trigger('search:viewModeChanged', ['map']);
});

$('body').on('search:viewModeChanged', function (e, eventViewMode) {
  viewMode = eventViewMode;
  const toggledFrom = (viewMode === 'list') ? 'map' : 'list';

  // Switch view-mode on body element.
  $('body').removeClass('is-' + toggledFrom + '-view').addClass('is-' + viewMode + '-view');

  // Button is in a container that contains elements we want to react on the
  // change.
  var $viewModes = $('#filterbar .view-mode');

  // Deactivate everything.
  $viewModes.find('.filterbar__tab').removeClass('filterbar__tab--active');

  // mobile
  $('body').removeClass('is-' + toggledFrom + '-view').addClass('is-' + viewMode + '-view');
});

