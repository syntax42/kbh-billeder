// ------------------------------------------
// Require - sorted alphabetically after npm name
// ------------------------------------------
require('dotenv').config({silent: true});

const gulp = require('gulp');

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

require('./build/gulp')(gulp, __dirname);

// ------------------------------------------
// Combining tasks
// ------------------------------------------

gulp.task('build', gulp.series(
  gulp.parallel('clean', 'bower'),
  gulp.parallel('css', 'js', 'svg')
));

// ------------------------------------------
// Default task
// ------------------------------------------

gulp.task('default',
  process.env.NODE_ENV === 'development' ?
    gulp.series('build', 'watch') :
    gulp.task('build')
);
