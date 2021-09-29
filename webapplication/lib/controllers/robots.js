'use strict';

var config = require('../../../shared/config');

exports.robotsTxt = function(req, res) {
  res.type('text/plain');

  var lines = [];
  if (config.allowRobots) {
    lines = [
      'User-agent: *',
      'Allow: *'
    ];
  } else {
    lines = [
      'User-agent: *',
      'Disallow: *'
    ];
  }
  res.send(lines.join('\n'));
};
