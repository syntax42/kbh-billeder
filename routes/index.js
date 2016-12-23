'use strict';

const frontpage = require('./frontpage');

module.exports = function (app) {
	// Frontpage override
  app.route('/').get(frontpage);
};
