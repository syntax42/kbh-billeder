'use strict';

function printAssetExceptions(state) {
  var errors = state.queries
    .reduce((result, query) => result.concat(query.errors), []);

  if (errors.length > 0) {
    var activity = 'Some errors occurred indexing assets';
    console.log('\n=== ' + activity + ' ===');

    errors.forEach((error, errorIndex) => {
      console.error(`Error ${errorIndex}/${errors.length}`);
      console.util(error, {depth: 10});
    });
  }

  return state;
}

module.exports = printAssetExceptions;
