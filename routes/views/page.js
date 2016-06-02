var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'page' // fix me

	locals.filters = {
		slug: req.params.slug,
	};
  locals.req = req;

	// Load the current page
	view.on('init', (next) => {

		var q = keystone.list('Page').model.findOne({
			slug: locals.filters.slug,
		});

		q.exec(function (err, result) {
			locals.page = result;
			next(err);
		});

	});

	// Render the view
  view.render('page');
};
