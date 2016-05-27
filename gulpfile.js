// ------------------------------------------
// Require - sorted alphabetically after npm name
// ------------------------------------------

var del = require('del')
var fs = require('fs')
var gulp = require('gulp')
var autoprefixer = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var svgmin = require('gulp-svgmin')
var svgstore = require('gulp-svgstore')
var uglify = require('gulp-uglify')
var gutil = require('gulp-util')
var sequence = require('run-sequence')

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

require('./node_modules/collections-online/build/gulp')(gulp)

// ------------------------------------------
// Combining tasks
// ------------------------------------------

gulp.task('build', function(callback) {
  // put stuff in arrays that you'd want to run in parallel
  sequence('clean', ['css', 'js'],
    callback)
})

// ------------------------------------------
// Default task
// ------------------------------------------

gulp.task('default', ['build'], function() {})
gulp.task('test', ['css'], function() {})
