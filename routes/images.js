
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
const THUMBNAIL_SIZE = 350;
// Looping through the licenses to find the on
const LICENSE_IDS_NEEDING_WATERMARK = config.licenseMapping
.map((license, licenseId) => {
  return {
    id: licenseId,
    watermark: license.watermark
  };
})
.filter(license => license.watermark)
.map(license => license.id);

// Resolving the watermark path relative to the app dir's images dir
var watermarkPath = path.normalize(config.appDir + '/images/watermarks');
const WATERMARK_BUFFERS = {
  'kbh-museum': fs.readFileSync(watermarkPath + '/kbh-museum.png'),
  'kbh-arkiv': fs.readFileSync(watermarkPath + '/kbh-arkiv.png'),
}

var FALLBACK_PATH = path.normalize(config.appDir + '/images/fallback.png');

const contentDispositionRegexp = /.*\.([^.]+)$/i;

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

  var proxyRequest = images.proxy(url, next);

  res._writeHead = res.writeHead;
  res.writeHead = function(statusCode, reasonPhrase, headers) {
    // Reading the file extension from the response from CIP
    var responseHeaders = proxyRequest.response.headers;
    var contentDispositionHeader = responseHeaders['content-disposition'] || '';
    var extension = contentDispositionHeader.match(contentDispositionRegexp);
    if(extension) {
      extension = '.' + extension[1];
    } else {
      extension = '.jpg'; // Default extension, when the CIP is not responsing
    }
    if(size) {
      // Remove JPEG from e.g. kbh-museum-26893-originalJPEG.jpg
      size = size.replace('JPEG', '');
      size = '-' + size;
    }
    // Generating a new filename adding size if it exists
    var filename = catalog + '-' + id + size + extension;
    res.header('content-disposition', 'attachment; filename=' + filename);
    res._writeHead(statusCode, reasonPhrase, headers);
  };

  proxyRequest.pipe(res);
}

function bottomRightPosition(img, watermarkImg) {
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

const POSITION_FUNCTIONS = {
  'middle-center': middleCenterPosition,
  'bottom-right': bottomRightPosition
}

function watermarkTransformation(watermarkBuffer, maxSize, positionFunction) {
  var imageData = [];
  return new Transform({
    transform(chunk, encoding, callback) {
      imageData.push(chunk);
      callback();
    },
    flush: function(callback) {
      img = new Image;
      img.src = Buffer.concat(imageData);

      // Cap the maxSize at the largest of the width and height to avoid
      // stretching beyound the original image
      maxSize = Math.min(maxSize, Math.max(img.width, img.height));

      var ratio = img.width / img.height;
      var newSize = {
        width: ratio >= 1 ? maxSize : maxSize * ratio,
        height: ratio < 1 ? maxSize : maxSize / ratio,
      };

      var canvas = new Canvas(newSize.width, newSize.height)
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newSize.width, newSize.height);
      // Trying to avoid a memory leak
      delete img;

      // If both a watermark buffer and position is defined, we can draw it
      if(watermarkBuffer && positionFunction) {
        var watermarkImg = new Image;
        watermarkImg.src = watermarkBuffer;
        var position = positionFunction(newSize, watermarkImg);
        // Draw the watermark in the
        ctx.drawImage(watermarkImg,
                      position.left,
                      position.top,
                      position.width,
                      position.height);
        // Trying to avoid a memory leak
        delete watermarkImg;
      }
      // Trying to avoid a memory leak
      delete ctx;

      // Size of the jpeg stream is just ~ 15% of the raw PNG buffer
      canvas.jpegStream()
      .on('data', (chuck) => {
        this.push(chuck);
      })
      .on('end', () => {
        callback();
        // Trying to avoid a memory leak
        delete canvas;
      });
    }
  });
}

function getErrorPlaceholderStream() {
  return fs.createReadStream(FALLBACK_PATH);
}

exports.thumbnail = function(req, res, next) {
  // Let's find out what the license on the asset is
  var catalogAlias = req.params.catalog;
  var id = req.params.id;
  var esId = catalogAlias + '-' + id;
  var size = req.params.size ? parseInt(req.params.size, 10) : THUMBNAIL_SIZE;

  var position = req.params.position || 'middle-center';
  if(!(position in POSITION_FUNCTIONS)) {
    throw new Error('Unexpected position function', position);
  }

  es.getSource({
    index: config.es.assetsIndex,
    type: 'asset',
    id: esId
  })
  .then(function(metadata) {
    var url = config.cip.baseURL + '/preview/thumbnail/' + catalogAlias + '/' + id;
    var proxyRequest = images.proxy(url, next);

    // Apply the watermark if the config's licenseMapping states it
    var applyWatermark = !metadata.license || LICENSE_IDS_NEEDING_WATERMARK.indexOf(metadata.license.id) > -1;
    // We should only apply the watermark when the size is large
    applyWatermark = applyWatermark && size > THUMBNAIL_SIZE;
    var watermark = null;
    var positionFunction = null;
    if (applyWatermark && catalogAlias in WATERMARK_BUFFERS) {
      watermark = WATERMARK_BUFFERS[catalogAlias];
      positionFunction = POSITION_FUNCTIONS[position];
    }
    var transformation = watermarkTransformation(watermark, size, positionFunction);

    proxyRequest
    .on('response', function(response) {
      if(response.statusCode === 200) {
        proxyRequest.pipe(transformation).pipe(res);
      } else {
        getErrorPlaceholderStream().pipe(res);
      }
    })
  }, next);
};
