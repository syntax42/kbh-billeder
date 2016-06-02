var keystone = require('keystone');

var index = require('collections-online/lib/controllers/index');
var search = require('collections-online/lib/controllers/search');

module.exports = function(req, res, next) {
  if ('q' in req.query) {
    console.log('req.originalUrl =', req.originalUrl);
    return search.result(req, res, next);
  } else {
    keystone.list('Gallery').model.find()
    .populate('items')
    .sort('order')
    .exec(function(err, galleries) {
      if(!err) {
        res.locals.galleries = galleries;
        return index.frontpage(req, res, next);
      } else {
        next(err);
      }
    });
  }
};
