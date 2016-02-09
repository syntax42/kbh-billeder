'use strict';
/*global $ */
////////////////////////////////////////////////////
// JS file containing logic used a cross the site //
////////////////////////////////////////////////////

// Typehead autosuggest for search field
// Currently not functioning
/*$(function() {
    var searchSuggest = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: '/suggest.json?text=%QUERY'
    });

    searchSuggest.initialize();

    $('#search-input').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
    }, {
        name: 'dropdown-menu',
        displayKey: function(data) {
            return data.text;
        },
        source: searchSuggest.ttAdapter(),
        templates: {
            suggestion: function (data) { return data.text; }
        }
    });
});*/

// Retrieve the main menu and its childern
$(function() {
    var $menu = $('.categories-menu .dropdown-menu-right');

    // Open / close main menu nav
    $('#heading-categories-menu, .gray-overlay').click(function() {
        $('body').toggleClass('categories-menu-open');
        return false;
    });

    $.ajax({url: '/catalogs', // Append path to mark active
    })
    .done(function(data) {
        $menu.html(data);

        // Expand menus
        $('a.expand-menu').click(function(e) {
            e.preventDefault();
            var $toggleButton = $(e.currentTarget);
            $toggleButton.parent().next('ul').slideToggle(300, function() {
                // Update the icon on the toggle button
                var expanded = $(this).is(':visible');
                $toggleButton.closest('li').toggleClass('expanded', expanded);
            });
        });
    })
    .fail(function() {
        $('.categories-menu .dropdown-menu-right').html('<li><a href="' + window.location.pathname + '" class="col-xs-12">Uups, der skete en fejl. Prøv at genindlæse siden...</a></li>');
    });
});


// Toogle asset images - zome in and out
$(function() {
    // We only want zooming on asset's primary images.
    $('.asset .primary-asset').click(function() {
        if ($(this).parent('div').hasClass('col-md-6')) {
            $(this).parent('div').removeClass('col-md-6');
            $(this).parent('div').addClass('col-md-12');
            // Also for the div below
            $(this).parent('div').next('div').removeClass('col-md-6');
            $(this).parent('div').next('div').addClass('col-md-12');
        } else {
            $(this).parent('div').removeClass('col-md-12');
            $(this).parent('div').addClass('col-md-6');
            // Also for the div below
            $(this).parent('div').next('div').removeClass('col-md-12');
            $(this).parent('div').next('div').addClass('col-md-6');
        }
    });
});

// Scroll to top button
$(function() {
    $('#toTop').scrollToTop(400);
});
