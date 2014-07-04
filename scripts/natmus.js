'use strict';
////////////////////////////////////////////////////
// JS file containing logic used a cross the site //
////////////////////////////////////////////////////


// Open / close main menu nav
$(function() {
    $('#heading-categories-menu a').click(function(e){
      $('body').toggleClass('categories-menu-open');
      return false;
    });
});


// Typehead autosuggest for search field
$(function() {
  var searchSuggest = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: 'suggest.json?text=%QUERY'
  });

  searchSuggest.initialize();

  $('#search-input').typeahead(null, {
    name: 'dropdown-menu',
    displayKey: 'text',
    source: searchSuggest.ttAdapter()
  });
});

// Retrieve the main menu and its childern
$(function() {
  $.ajax({url: 'main-menu/catalogs', // Append path to mark active
  })
  .done(function(data) {
    $('.categories-menu .nav').html(data);

    // Expand menus
    $('.categories-menu ul a.col-xs-2').click(function(e) {
      e.preventDefault();
      $(this).next('ul').slideToggle(300);
    });
  })
  .fail(function(data) {
    $('.categories-menu .nav').html('<li><a href="' + window.location.pathname + '" class="col-xs-12">Uups, der skete en fejl. Prøv at genindlæse siden...</a></li>');
  });
});


// Toogle asset images - zome in and out
$(function() {
  $('.asset-image').click(function(e) {
    if ($(this).parent('div').hasClass('col-md-6')) {
      $(this).parent('div').removeClass('col-md-6');
      $(this).parent('div').addClass('col-md-12');
    } else {
      $(this).parent('div').removeClass('col-md-12');
      $(this).parent('div').addClass('col-md-6');
    }
  });
});