$('[data-action="toggle-sidebar-menu"], .gray-overlay').click(function() {
  $('body').toggleClass('sidebar-menu-open');
});

$('[data-action="toggle-sidebar-submenu-item"]').click(function() {
  $(this).parent('li').find('.children').toggleClass('hidden');
});