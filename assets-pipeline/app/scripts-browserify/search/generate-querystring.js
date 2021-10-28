/**
 * This module generates querystrings that will lead to a specific filtering
 * and sorting being activated. This is the inverse of get-parameters
 */

var querystring = require('querystring');
const DEFAULT_SORTING = require('./default-sorting');

module.exports = function(searchParameters) {

  var parameters = searchParameters.filters || {};

  // Rename queryString to q when represented in the URL
  if (parameters.queryString) {
    // Joining on space, but this just has a single element
    parameters.q = parameters.queryString.join(' ');
    delete parameters.queryString;
  }

  if (searchParameters.sorting && searchParameters.sorting != DEFAULT_SORTING) {
    parameters.sort = searchParameters.sorting;
  }

  Object.keys(parameters).forEach(function(field) {
    var value = parameters[field];
    if(typeof(value) === 'object' && value.length > 0) {
      parameters[field] = value.join(',');
    } else if(typeof(value) === 'string' && value != '') {
      // Don't do anything
    } else {
      delete parameters[field];
    }
  });

  // Add map arguments of we have any.
  if (searchParameters.map) {
    parameters.map = searchParameters.map;
  }
  if (searchParameters.smap) {
    parameters.smap = searchParameters.smap;
  }
  var result = querystring.stringify(parameters);

  result = result.replace(/%20/g,'+').replace(/%2C/g,',');
  return result ? '?' + result : '';
};
