'use strict';

var querystring = require('querystring');
var proxy = require('../proxy');

exports.proxy = proxy;

/**
 * Proxies a request to the image backend that will return a stream with a
 * download of the image in a large size.
 * id is the entire id (Catalog alias / asset id), ex DNT/123
 * size is a parameter that
 * next is a callback method for potential errors
 */
exports.proxyDownload = (id, params) => {
  var url = '/asset/download/' + id;
  if (params.options) {
    url += '?options=' + params.options;
  }
  return proxy(url);
};

/**
 * Proxies a request to the image backend that will return a stream with a
 * thumbnail.
 * id is the entire id (Catalog alias / asset id), ex DNT/123
 * next is a callback method for potential errors
 */
exports.proxyThumbnail = (id) => {
    return proxy('/preview/thumbnail/' + id);
};
