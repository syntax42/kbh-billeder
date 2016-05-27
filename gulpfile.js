// ------------------------------------------
// Require - sorted alphabetically after npm name
// ------------------------------------------

var gulp = require('gulp')
var sequence = require('run-sequence')
var config = require('./config')

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

require('./node_modules/collections-online/build/gulp')(gulp, config)

// ------------------------------------------
// Combining tasks
// ------------------------------------------

gulp.task('build', function (callback) {
  // put stuff in arrays that you'd want to run in parallel
  sequence('clean', ['css', 'js'],
    callback)
})

// ------------------------------------------
// Default task
// ------------------------------------------

gulp.task('default', ['build'], function () {})
gulp.task('test', function (callback) {
  sequence('bower', ['css', 'js'], callback)
})

gulp.task('svg-test', function (callback) {
  sequence('svg', callback)
})
