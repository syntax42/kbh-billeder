
var config = require('../config');
var images = require('collections-online/lib/controllers/images');
var es = require('collections-online/lib/services/elasticsearch');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var Canvas = require('canvas')
var Image = Canvas.Image;
const Transform = require('stream').Transform;

const POSSIBLE_SIZES = ['lille', 'mellem', 'stor', 'originalJPEG', 'original'];
const WATERMARK_SCALE = 0.33; // 20% of the width of the thumbnail

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

function bottomLeftPosition(img, watermarkImg) {
  var watermarkRatio = watermarkImg.height / watermarkImg.width;

  var watermarkWidth = img.width * WATERMARK_SCALE;
  var watermarkHeight = watermarkWidth * watermarkRatio;

  return {
    left: img.width - watermarkWidth,
    top: img.height - watermarkHeight,
    width: watermarkWidth,
    height: watermarkHeight
  };
}

function middleCenterPosition(img, watermarkImg) {
  var watermarkRatio = watermarkImg.height / watermarkImg.width;

  var watermarkWidth = img.width * WATERMARK_SCALE;
  var watermarkHeight = watermarkWidth * watermarkRatio;

  return {
    left: img.width/2 - watermarkWidth / 2,
    top: img.height/2 - watermarkHeight / 2,
    width: watermarkWidth,
    height: watermarkHeight
  };
}

const watermarkPositionFunction = middleCenterPosition;

function watermarkTransformation(watermarkPath) {
  // Resolving the watermark path relative to the app dir's images dir
  watermarkPath = path.normalize(config.appDir + '/images' + watermarkPath);
  var imageData = [];

  return new Transform({
    transform(chunk, encoding, callback) {
      imageData.push(chunk);
      callback();
    },
    flush: function(callback) {
      img = new Image;
      img.src = Buffer.concat(imageData);

      var canvas = new Canvas(img.width, img.height)
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      var pngStream = canvas.pngStream();

      // Read the watermark file
      // TODO: Consider doing this file-load only once, when the app starts
      fs.readFile(watermarkPath, (err, watermarkData) => {
        if (err) throw err;
        var watermarkImg = new Image;
        watermarkImg.src = watermarkData;
        var position = watermarkPositionFunction(img, watermarkImg);

        // Draw the watermark in the
        ctx.drawImage(watermarkImg,
                      position.left,
                      position.top,
                      position.width,
                      position.height);

        // Size of the jpeg stream is just ~ 15% of the raw PNG buffer
        canvas.jpegStream()
        .on('data', (chuck) => {
          this.push(chuck);
        })
        .on('end', () => {
          callback();
        });
      });
    }
  });
}

const watermarkPaths = {
  'kbh-museum': '/watermarks/kbh-museum.png',
  'stadsarkivet': '/icons/kbh-stads.svg'
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
      var transformation = watermarkTransformation(watermarkPaths[catalogAlias]);
      proxyRequest = proxyRequest.pipe(transformation);
    }

    return proxyRequest.pipe(res);
  }, next);
};
