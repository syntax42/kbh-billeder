var keystone = require('keystone');
const plugins = require('../../../../../collections-online/plugins');

module.exports = function (req, res, next) {
  var locals = res.locals;
  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'page'; // fix me

  locals.filters = {
    slug: req.params.slug,
  };

  locals.data = {
    page: []
  };
  locals.req = req;

  var q = keystone.list('Page').model.findOne({
    slug: locals.filters.slug,
  });

  q.exec(function (err, result) {
    if(result && !err) {
      locals.data.page = result;
      // Create a view and render
      var view = new keystone.View(req, res);

      const renderers = plugins.getAll('keystone-pre-renderer');

      if (renderers) {
        // Wrap each renderer in a function that passes the request and locals
        // the renderer will need and the callback we need invoked when the
        // render is done.
        renderers.forEach((renderer) => {
          view.on('render', function(next) {
            renderer.render(next, locals, req);
          });
        });
      }

      // Render the view
      view.render('page');
    } else if(err) {
      err.status = 500;
      next(err);
    } else {
      next();
    }
  });
};
