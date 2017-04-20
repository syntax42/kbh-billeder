'use strict';

/**
 * Running the indexing procedure.
 */

var Q = require('q');

function run(state) {
  // TODO: Consider having a mode and referecen parameter on the run method,
  // for this module to be controlled by other modules.

  if (!state) {
    state = {};
  }

  var steps = [
    require('./initialize/elastic-search-index'),
    require('./initialize/cip-client'),
    require('./initialize/mode'),
    require('./modes/run'),
    require('./post-processing/print-asset-exceptions')
  ];

  return steps.reduce(Q.when, new Q(state));
}

module.exports = run;

if (module.id === '.') {
  // Call run here, if the module was not loaded by some other module.
  run().then(function() {
    console.log('\nAll done - good bye!');
    process.exit(0);
  }, function(err) {
    console.error('An error occured!');
    console.error(err.stack || err);
    process.exit(1);
  });
}
