var Q = require('q');
var keystone = require('keystone');

const MENUS = ['main', 'footer'];

module.exports = function(app) {
  var menuItems = {};
  Q.all(MENUS.map((menu) => {
  	return keystone.list('Menu item').model.find({
  		placement: menu
  	}).populate('page').exec(function(err, items) {
      menuItems[menu] = items.map((item) => {
        if(item.page) {
          item.url = '/' + item.page.slug;
        } else if(item.link) {
          item.url = item.link;
        }
        return item;
      });
    });
  })).then(function() {
    app.set('menus', menuItems);
  });
};

module.exports.MENUS = MENUS;
