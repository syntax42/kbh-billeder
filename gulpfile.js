//------------------------------------------
// Require
//------------------------------------------
var del = require('del')
var fs = require('fs')
var gulp = require('gulp')
var autoprefixer = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var gutil = require('gulp-util')
var sequence = require('run-sequence')

//------------------------------------------
// Directories
//------------------------------------------
var DEST_DIR = 'generated/'
var COLLECTIONS_ONLINE = 'node_modules/collections-online/'
var STYLES_SRC = 'app/styles/main.scss'
var STYLES_DEST = DEST_DIR + 'styles'
var SCRIPTS_FOLDER = COLLECTIONS_ONLINE + 'app/scripts/'
var SCRIPTS_CUSTOM = SCRIPTS_FOLDER + '*.js'
// Blacklisting scripts - this should be done smarter at some point
var SCRIPT_NO_1 = '!' + SCRIPTS_FOLDER + 'geo-tagging.js'
var SCRIPTS_DEST = DEST_DIR + 'scripts'
var SCRIPT_NAME = 'main.js'

//------------------------------------------
// Individual tasks
//------------------------------------------
gulp.task('css', function() {
  return gulp.src(STYLES_SRC)
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(STYLES_DEST))
})

gulp.task('js', function() {
  return gulp.src([SCRIPTS_CUSTOM, SCRIPT_NO_1])
    .pipe(sourcemaps.init())
    .pipe(concat(SCRIPT_NAME))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(SCRIPTS_DEST));
});

gulp.task('clean', function() {
  return del([DEST_DIR])
})

//------------------------------------------
// Combining tasks
//------------------------------------------
gulp.task('build', function(callback) {
  // put stuff in arrays that you'd want to run in parallel
  sequence('clean', ['css', 'js'],
    callback)
})

//------------------------------------------
// Default task
//------------------------------------------
gulp.task('default', ['build'], function() {})
