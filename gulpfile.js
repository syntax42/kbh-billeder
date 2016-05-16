var gulp  = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var del = require('del');
var fs = require('fs');


var GENERATED_DIR = 'generated';
var STYLES_MAIN = 'app/styles/main.scss';
var STYLES_FOLDER = GENERATED_DIR + '/styles'

gulp.task('build', function(callback) {
  runSequence('build-clean',
              // ['build-scripts', 'build-styles'],
              'build-css',
              callback);
});

gulp.task('default', ['build'], function() {
});

gulp.task('build-css', function() {
  return gulp.src(STYLES_MAIN)
    .pipe(sass())
    .pipe(gulp.dest(STYLES_FOLDER));
});

gulp.task('build-clean', function() {
  return del([GENERATED_DIR]);
});
