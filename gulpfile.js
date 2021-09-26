// TODO: Config must have customization set as very first because some modules depend on config being complete at require time (bad, shouldfix)
require('dotenv').config({silent: true});
const config = require('./lib/config');
config.setCustomizationPath(__dirname);

var isDevelopment = process.env.NODE_ENV === 'development';

const gulp = require('gulp');
const bower = require('gulp-bower');
const gulpCss = require('./build/gulp-css');

// ------------------------------------------
// If possible, remove these tasks completely:
// ------------------------------------------
gulp.task('reload-config', function(done) {
  config.reload();
  done();
});

gulp.task('bower', () => {
  return bower();
});

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

gulpCss(gulp);
require('./build/gulp')(gulp, config, isDevelopment);

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
