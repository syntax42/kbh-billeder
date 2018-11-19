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

gulp.task('build', gulp.series('clean', 'css', 'js', 'svg'));

// ------------------------------------------
// Default task
// ------------------------------------------
if (process.env.NODE_ENV === 'development') {
  gulp.task('default', gulp.series('build', 'watch'));
}
else {
  gulp.task('default', gulp.series('build'));
}
