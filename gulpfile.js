var gulp  = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var sequence = require('run-sequence');
var del = require('del');
var fs = require('fs');


var GENERATED_DIR = 'generated';
var STYLES_MAIN = 'app/styles/main.scss';
var STYLES_FOLDER = GENERATED_DIR + '/styles'

// Individual tasks
gulp.task('build-css', function() {
  return gulp.src(STYLES_MAIN)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(STYLES_FOLDER));
});

gulp.task('build-clean', function() {
  return del([GENERATED_DIR]);
});

// Combining tasks
gulp.task('build', function(callback) {
  // put stuff in arrays that you'd want to run in parallel
  sequence('build-clean',
          ['build-css'],
          callback);
});

// Default tasks
gulp.task('default', ['build'], function() {
});
