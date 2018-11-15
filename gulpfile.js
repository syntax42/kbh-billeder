// ------------------------------------------
// Require - sorted alphabetically after npm name
// ------------------------------------------
require('dotenv').config({silent: true});

var gulp = require('gulp')

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

require('collections-online/build/gulp')(gulp, __dirname);

// ------------------------------------------
// Combining tasks
// ------------------------------------------

gulp.task('build', gulp.series(function (callback) {
  return new Promise(function(resolve) {
    gulp.series('clean', 'bower', 'css', 'js', 'svg', callback);
    resolve();
  });
}));

// ------------------------------------------
// Default task
// ------------------------------------------

gulp.task('default', gulp.series(function (callback) {
  if (process.env.NODE_ENV === 'development') {
    return new Promise(function(resolve) {
      gulp.series('build', 'watch', callback);
      resolve();
    });
  } else {
    return new Promise(function(resolve) {
      gulp.series('build', callback);
      resolve();
    });
  }
}));
