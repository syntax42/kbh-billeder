// ------------------------------------------
// Require - sorted alphabetically after npm name
// ------------------------------------------

var gulp = require('gulp')
var sequence = require('run-sequence')

// ------------------------------------------
// Get the gulp content from the main
// ------------------------------------------

require('./node_modules/collections-online/build/gulp')(gulp)

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
gulp.task('test', ['css'], function () {})
