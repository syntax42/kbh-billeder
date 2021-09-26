const autoprefixer = require('gulp-autoprefixer');
const bower = require('gulp-bower');
const browserify = require('browserify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const CustomPug = require('./custom-pug.js');
const del = require('del');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const uglify = require('gulp-uglify');
const uniqueFiles = require('gulp-unique-files');

module.exports = (gulp, config) => {
  const customPug = CustomPug(config);

  //------------------------------------------
  // Directories - note that they are relative to the project specific gulpfile
  //------------------------------------------
  var DEST_DIR = './generated';
  var SCRIPTS_DEST = DEST_DIR + '/scripts';
  var SVG_SRC = './app/images/icons/*.svg';
  var PUG_SRC = './app/views/**/*.pug';
  var isDevelopment = process.env.NODE_ENV === 'development';

  // Add bower scripts
  var BOWER_SCRIPTS = [
    '/jquery/dist/jquery.js',
    '/typeahead.js/dist/typeahead.bundle.js',
    '/slick-carousel/slick/slick.min.js',
    '/formatter.js/dist/jquery.formatter.min.js',
    '/auth0-lock/build/lock.min.js'
  ].map((script) => {
    return './bower_components' + script;
  });

  var SCRIPTS_ALL = [
    ...BOWER_SCRIPTS,
    './app/scripts/*.js'
  ];

  // Add the runtime lib used to run pug templates
  var SCRIPTS_BROWSERIFY_DIR = './app/scripts-browserify';

  gulp.task('reload-config', function(done) {
    config.reload();
    done();
  });

  // Return only
  //------------------------------------------
  // Individual tasks
  //------------------------------------------
  gulp.task('bower', () => {
    return bower();
  });

  gulp.task('css', () => {
    return gulp.src('./app/styles/main.scss', {sourcemaps: true})
      .pipe(plumber())
      .pipe(sass().on('error', function(err) {
        console.error('\x07');
        sass.logError.bind(this)(err);
      }))
      .pipe(cleanCSS())
      .pipe(autoprefixer())
      .pipe(gulp.dest(DEST_DIR + '/styles', {sourcemaps: '.'}));
  });

  gulp.task('pug', () => {
    return gulp.src(PUG_SRC)
      .pipe(uniqueFiles())
      .pipe(pug({
        client: true,
        compileDebug: isDevelopment,
        pug: customPug
      }))
      .on('error', function (err) {
        console.log('Error while compiling pug');
        console.log(err.toString());
        // This will thrown an error since we're going to write to files after
        // we've emitted an "end" - but this is the best we can do for now.
        this.emit('end');
      })
      .pipe(gulp.dest(DEST_DIR + '/views'));
  });

  gulp.task('js-browserify', gulp.series('pug', () => {
    return browserify({
      paths: [
        SCRIPTS_BROWSERIFY_DIR,
        DEST_DIR
      ],
      debug: isDevelopment,
      entries: SCRIPTS_BROWSERIFY_DIR + '/index.js',
      insertGlobalVars: {
        clientSideConfig: function(file, dir) {
          const clientSideConfig = config.getClientSideConfig();
          return JSON.stringify(clientSideConfig);
        }
      }
    })
      .transform('babelify', {
        'env': {
          'production': {
            'presets': [
              'babel-preset-latest',
              //'babel-preset-babili'
            ]
          },
          'beta': {
            'presets': [
              'babel-preset-latest',
              //'babel-preset-babili'
            ]
          }
        },
        plugins: [
          [
            'babel-plugin-module-resolver',
            {'alias': {
              '@shared': './shared',
              '@views': './generated/views',
            }}
          ],
        ],
      })
      .bundle()
      .on('error', function(err){
        console.log(err.stack);
      })
      .pipe(source('browserify-index.js'))
      .pipe(gulp.dest(SCRIPTS_DEST));
  }));

  gulp.task('js', gulp.series('js-browserify', () => {
    var scriptPaths = [
      ...SCRIPTS_ALL,
      SCRIPTS_DEST + '/browserify-index.js'
    ];
    return gulp.src(scriptPaths)
      .pipe(uniqueFiles())
      .pipe(concat('main.js'))
      .pipe(gulp.dest(SCRIPTS_DEST))
      .pipe(gulpif(!isDevelopment, uglify().on('error', console.error)))
      .pipe(gulp.dest(SCRIPTS_DEST))
      .on('error', function(err){
        console.log(err.stack);
      });
  }));

  gulp.task('svg', () => {
    return gulp.src(SVG_SRC)
      .pipe(uniqueFiles())
      .pipe(svgmin())
      .pipe(rename({prefix: 'icon-'}))
      .pipe(svgstore())
      .pipe(gulp.dest(DEST_DIR + '/images'));
  });

  gulp.task('watch', (done) => {
    gulp.watch('./app/styles/**/*.scss', {interval: 500}, gulp.task('css'));
    gulp.watch(SVG_SRC, {interval: 500}, gulp.task('svg'));
    gulp.watch(PUG_SRC, {interval: 500}, gulp.task('js'));
    gulp.watch([
      ...SCRIPTS_ALL,
      SCRIPTS_BROWSERIFY_DIR + '/**/*.js',
      './config/**/*',
      './shared/*.js'
    ], {interval: 500}, gulp.series('reload-config', 'js'));

    done();
  });

  gulp.task('clean', () => {
    return del([DEST_DIR]);
  });
};
