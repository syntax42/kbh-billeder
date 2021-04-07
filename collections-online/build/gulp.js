const autoprefixer = require('gulp-autoprefixer');
const bower = require('gulp-bower');
const browserify = require('browserify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const CustomPug = require('./custom-pug.js');
const del = require('del');
const gulpif = require('gulp-if');
const path = require('path');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const uglify = require('gulp-uglify');
const uniqueFiles = require('gulp-unique-files');

module.exports = (gulp, customizationPath) => {
  const config = require('../lib/config');
  config.setCustomizationPath(customizationPath);

  const customPug = CustomPug(config);

  //------------------------------------------
  // Directories - note that they are relative to the project specific gulpfile
  //------------------------------------------
  var DEST_DIR = path.join(customizationPath, 'generated');
  var ROOT_CO = __dirname + '/..';
  var BOWER_COMPONENTS_CO = ROOT_CO + '/bower_components';
  var STYLES_SRC = customizationPath + '/app/styles/main.scss';
  var STYLES_ALL = [
    customizationPath + '/app/styles/*.scss',
    ROOT_CO + '/app/styles/**/*.scss'
  ];
  var STYLES_DEST = DEST_DIR + '/styles';
  var SCRIPTS_FOLDER_CO = ROOT_CO + '/app/scripts';
  var SCRIPTS_CO = SCRIPTS_FOLDER_CO + '/*.js';
  var SCRIPTS_ARRAY_CO = [SCRIPTS_CO];
  var SCRIPTS = customizationPath + '/app/scripts/*.js';
  var SCRIPTS_DEST = DEST_DIR + '/scripts';
  var SCRIPT_NAME = 'main.js';
  var SVG_SRC_CO = ROOT_CO + '/app/images/icons/*.svg';
  var SVG_SRC = customizationPath + '/app/images/icons/*.svg';
  var SVG_DEST = DEST_DIR + '/images';
  var PUG_SRC_CO = ROOT_CO + '/app/views/**/*.pug';
  var PUG_SRC = customizationPath + '/app/views/**/*.pug';
  var PUG_DEST = DEST_DIR + '/views';
  var isDevelopment = process.env.NODE_ENV === 'development';

  // Add bower scripts
  var BOWER_SCRIPTS = [
    '/jquery/dist/jquery.js',
    '/ev-emitter/ev-emitter.js',
    '/imagesloaded/imagesloaded.js',
    '/jquery-infinite-scroll/jquery.infinitescroll.js',
    //'/get-size/get-size.js',
    //'/desandro-matches-selector/matches-selector.js',
    //'/fizzy-ui-utils/utils.js',
    //'/outlayer/item.js',
    //'/outlayer/outlayer.js',
    '/picturefill/dist/picturefill.js',
    '/typeahead.js/dist/typeahead.bundle.js',
    '/scrollToTop/jquery.scrollToTop.js',
    '/slick-carousel/slick/slick.min.js',
    '/formatter.js/dist/jquery.formatter.min.js',
    '/auth0-lock/build/lock.min.js'
  ].map((script) => {
    return BOWER_COMPONENTS_CO + script;
  });


  SCRIPTS_ARRAY_CO = BOWER_SCRIPTS.concat(SCRIPTS_ARRAY_CO);

  // Add Project specific scripts at the end.
  // Overwrites thanks to uniqueFiles in the js task
  SCRIPTS_ARRAY_CO.push(SCRIPTS);

  // Add the runtime lib used to run pug templates
  var SCRIPTS_BROWSERIFY_DIR_CO = ROOT_CO + '/app/scripts-browserify';
  var SCRIPTS_BROWSERIFY_DIR = customizationPath + '/app/scripts-browserify';

  var SCRIPTS_ALL = SCRIPTS_ARRAY_CO;

  gulp.task('reload-config', function(done) {
    config.reload();
    done();
  });

  // Return only
  //------------------------------------------
  // Individual tasks
  //------------------------------------------
  gulp.task('bower', () => {
    return bower({cwd: ROOT_CO});
  });

  gulp.task('css', () => {
    return gulp.src(STYLES_SRC)
      .pipe(plumber())
      .pipe(gulpif(isDevelopment, sourcemaps.init()))
      .pipe(sass().on('error', function(err) {
        console.error('\x07');
        sass.logError.bind(this)(err);
      }))
      .pipe(cleanCSS())
      .pipe(autoprefixer())
      .pipe(gulpif(isDevelopment, sourcemaps.write()))
      .pipe(gulp.dest(STYLES_DEST));
  });

  gulp.task('pug', () => {
    return gulp.src([PUG_SRC_CO, PUG_SRC])
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
      .pipe(gulp.dest(PUG_DEST));
  });

  gulp.task('js-browserify', gulp.series('pug', () => {
    return browserify({
      paths: [
        SCRIPTS_BROWSERIFY_DIR,
        SCRIPTS_BROWSERIFY_DIR_CO,
        DEST_DIR
      ],
      basedir: SCRIPTS_BROWSERIFY_DIR,
      debug: isDevelopment,
      entries: './index.js',
      insertGlobalVars: {
        clientSideConfig: function(file, dir) {
          const clientSideConfig = config.getClientSideConfig();
          return JSON.stringify(clientSideConfig);
        }
      }
    })
    .transform('babelify', {
      // Mapping because of https://github.com/babel/gulp-babel/issues/93,
      'env': {
        'production': {
          'presets': [
            'babel-preset-latest',
            //'babel-preset-babili'
          ].map(require.resolve)
        },
        'beta': {
          'presets': [
            'babel-preset-latest',
            //'babel-preset-babili'
          ].map(require.resolve)
        }
      },
      plugins: [
        [ require.resolve("babel-plugin-module-resolver"), {
          "alias": {
            "@collections-online": "./collections-online",
          }
        } ],
      ],
      // Global is needed because JS in collections-online is considered global
      global: !isDevelopment
    })
    .bundle()
    .on('error', function(err){
      console.log(err.stack);
    })
    .pipe(source('browserify-index.js'))
    .pipe(gulp.dest(SCRIPTS_DEST));
  }));

  gulp.task('js', gulp.series('js-browserify', () => {
    var scriptPaths = SCRIPTS_ARRAY_CO.concat([
      SCRIPTS_DEST + '/browserify-index.js'
    ]);
    return gulp.src(scriptPaths)
      .pipe(uniqueFiles())
      .pipe(concat(SCRIPT_NAME))
      .pipe(gulp.dest(SCRIPTS_DEST))
      .pipe(gulpif(!isDevelopment, uglify().on('error', console.error)))
      .pipe(gulp.dest(SCRIPTS_DEST))
      .on('error', function(err){
        console.log(err.stack);
      });
  }));

  gulp.task('svg', () => {
    return gulp.src([SVG_SRC_CO, SVG_SRC])
      .pipe(uniqueFiles())
      .pipe(svgmin())
      .pipe(rename({prefix: 'icon-'}))
      .pipe(svgstore())
      .pipe(gulp.dest(SVG_DEST));
  });

  gulp.task('watch', (done) => {
    gulp.watch(STYLES_ALL, { interval: 500 }, gulp.task('css'));
    gulp.watch([SVG_SRC, SVG_SRC_CO], { interval: 500 }, gulp.task('svg'));
    gulp.watch([PUG_SRC_CO, PUG_SRC], { interval: 500 }, gulp.task('js'));
    gulp.watch([
      ...SCRIPTS_ALL,
      SCRIPTS_BROWSERIFY_DIR_CO + '/**/*.js',
      SCRIPTS_BROWSERIFY_DIR + '/**/*.js',
      customizationPath + '/config/**/*',
      customizationPath + '/shared/*.js'
    ], { interval: 500 }, gulp.series('reload-config', 'js'));

    done();
  });

  gulp.task('clean', () => {
    return del([DEST_DIR]);
  });
};
