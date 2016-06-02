var Q = require('q');
var keystone = require('keystone');

const MENUS = ['main', 'footer'];

module.exports = function(app) {
  var MenuItem = keystone.list('Menu item');

  var menuItems = {};
  Q.all(MENUS.map((menu) => {
  	return MenuItem.model.find({
  		placement: menu
  	}).populate('page').exec(function(err, items) {
      menuItems[menu] = items.map((item) => {
        item.url = item.getUrl();
        return item;
      });
    });
  })).then(function() {
    app.set('menus', menuItems);
  });
};

module.exports.MENUS = MENUS;
