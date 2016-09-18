
var config = require('../config');
var images = require('collections-online/lib/controllers/images');
var es = require('collections-online/lib/services/elasticsearch');
var Q = require('q');
var fs = require('fs');
var path = require('path');

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

  images.proxy(url, next).pipe(res);
}

function doApplyWatermark(catalogAlias, id, req) {
  var deferred = Q.defer();

  try {
    var tempBasePath = '/tmp/co-' + catalogAlias + '-' + id;
    var tempFilePath = tempBasePath + '-thumbnail.jpg';
    var tempWatermarkedPath = tempBasePath + '-watermarked.jpg';

    var imagesPath = path.normalize(config.appDir + '/images');
    var watermarkPaths = {
      'kbh-museum': imagesPath + '/icons/kbh-mus.svg',
      'stadsarkivet': imagesPath + '/icons/kbh-stads.svg'
    };
    var watermarkPath = watermarkPaths[catalogAlias];

    // Download the file
    req.pipe(fs.createWriteStream(tempFilePath))
    .on('finish', function() {
    })
    .on('error', deferred.reject);
  } catch(err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

exports.socialThumbnail = function(req, res, next) {
  // Let's find out what the license on the asset is
  var catalogAlias = req.params.catalog;
  var id = req.params.id;
  var esId = catalogAlias + '-' + id;

  es.getSource({
    index: config.es.assetsIndex,
    type: 'asset',
    id: esId
  })
  .then(function(metadata) {
    var applyWatermark = !metadata.license || metadata.license.id !== 8;
    var url = config.cip.baseURL + '/preview/thumbnail/' + catalogAlias + '/' + id;
    var proxyRequest = images.proxy(url, next);
    if(applyWatermark) {
      doApplyWatermark(catalogAlias, id, proxyRequest)
      .then(function(thumbnailStream) {
        thumbnailStream.pipe(res);
      }, next);
    } else {
      return proxyRequest.pipe(res);
    }
  }, next);
};
