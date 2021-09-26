const browserify = require('browserify');
const concat = require('gulp-concat');
const CustomPug = require('./custom-pug.js');
const del = require('del');
const gulpif = require('gulp-if');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const uglify = require('gulp-uglify');
const uniqueFiles = require('gulp-unique-files');

module.exports = (gulp, config, isDevelopment) => {
  const customPug = CustomPug(config);

  //------------------------------------------
  // Directories - note that they are relative to the project specific gulpfile
  //------------------------------------------
  var DEST_DIR = './generated';
  var SCRIPTS_DEST = DEST_DIR + '/scripts';
  var SVG_SRC = './app/images/icons/*.svg';
  var PUG_SRC = './app/views/**/*.pug';

  // Add bower scripts
  var BOWER_SCRIPTS = [
    '/jquery/dist/jquery.js',
    '/typeahead.js/dist/typeahead.bundle.js',
    '/slick-carousel/slick/slick.min.js',
    '/formatter.js/dist/jquery.formatter.min.js',
  ].map((script) => {
    return './bower_components' + script;
  });

  var SCRIPTS_ALL = [
    ...BOWER_SCRIPTS,
    './app/scripts/*.js'
  ];

  // Add the runtime lib used to run pug templates
  var SCRIPTS_BROWSERIFY_DIR = './app/scripts-browserify';

  gulp.task('pug', () => {
    return gulp.src(PUG_SRC)
      .pipe(uniqueFiles())
      .pipe(pug({
        client: true,
        compileDebug: isDevelopment,
        pug: customPug
      }))
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
