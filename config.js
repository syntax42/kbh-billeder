'use strict';

var _ = require('lodash');

if (process.env.NODE_ENV) {
  console.log('Loading ' + process.env.NODE_ENV + ' configuration');
  var environmentConfig = require('./config/env/' + process.env.NODE_ENV + '.js');
} else {
  throw new Error('Please specify a NODE_ENV environment variable.');
}

module.exports = _.merge(
 require('./config/env/all.js'),
 environmentConfig || {});
