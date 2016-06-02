/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('underscore');
var KeystoneMenus = require('keystone-menus');

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	var locals = res.locals;

	var builder = KeystoneMenus.builder();
	builder.build('headerMenu')
		.then(function(menu){
			locals.headerMenu = menu.render(req.path, {'class': 'nav-menu'}, {}, {});
		});

	builder.build('footerMenu')
		.then(function(menu){
			locals.footerMenu = menu.render(req.path, {'class': 'footer-menu'}, {}, {});
		});

	next();
};

/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

