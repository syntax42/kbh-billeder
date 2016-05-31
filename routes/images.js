
var config = require('../config');
var proxy = require('collections-online/lib/controllers/images').proxy;

const POSSIBLE_SIZES = ['lille', 'mellem', 'stor', 'originalJPEG', 'original'];

exports.download = function(req, res, next) {
  var catalog = req.params.catalog;
  var id = req.params.id;
  var size = req.params.size;

  var url = config.cip.baseURL + '/asset/download/' + catalog + '/' + id;

  if (size && POSSIBLE_SIZES.indexOf(size) !== -1) {
    url += '?options=' + size;
  } else {
    throw new Error('The size is required and must be one of ' +
                    POSSIBLE_SIZES +
                    ' given: "' + size + '"');
  }

  proxy(url, res, next);
}
