// Set Gulp variables
const { src, dest, watch, series, parallel } = require('gulp');

// CSS related plugins
const sass = require('gulp-sass'),
      cssnano = require("cssnano"),
      postcss = require('gulp-postcss'),
      combinemq = require('postcss-combine-media-query'),
      autoprefixer = require('autoprefixer');

// Set sass compiler
sass.compiler = require('node-sass');

// JS related plugins
const babel = require('gulp-babel'),
      browserify = require('browserify'),
      buffer = require('vinyl-buffer'),
      source = require('vinyl-source-stream'),
      uglify = require('gulp-uglify');

// Utility plugins
const rename = require('gulp-rename'),
      plumber = require('gulp-plumber'),
      imagemin = require('gulp-imagemin');

// Set browser sync variable
const browserSync = require('browser-sync').create();

// File paths
const scssSrc = './src/scss/',
      jsSrc = './src/js/',
      imgSrc = './src/img/',
      fontSrc = './src/fonts/',
      app = './app';

// Watch files
const styleWatch = scssSrc + '**/*.scss',
      jsWatch = jsSrc + '**/*.js',
      imgWatch = imgSrc + '**/*.*',
      fontsWatch = fontSrc + '**/*.*',
      htmlWatch = './src/**/*.html';

// CSS Task
const cssTask = () => {
  return src(scssSrc + 'style.scss', { sourcemaps: true })

    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(postcss(
      [
        autoprefixer('last 2 versions', '> 1%'),
        combinemq(),
        cssnano()
      ]
    ))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(app + '/css/', { sourcemaps: '.' }))
    .pipe(browserSync.stream()
  );
}

// Browserify Task
const browserifyTask = () => {
  return browserify(jsSrc + 'scripts')
    .bundle()
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(dest('./src/js'))
}

// Javascript Task
const jsTask = () => {
  return src(jsSrc + 'scripts.js', { sourcemaps: true })
    .pipe(babel({ presets: ['@babel/preset-env']}))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(app + '/js/', { sourcemaps: '.' }));
}

// Image Task
const imageTask = () => {
  return src(imgWatch)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(dest(app + '/img/')
  );
}

// Fonts Task
const fontsTask = () => {
  return triggerPlumber(fontsWatch, app + '/fonts/')
}

// HTML Task
const htmlTask = () => {
  return triggerPlumber(htmlWatch, app)
}

// Plumber Task
const triggerPlumber = (srcFile, destFile) => {
  return src(srcFile)
    .pipe(plumber())
    .pipe(dest(destFile)
  );
}

// Reload Task
function reload(done) {
  browserSync.reload();

	done();
}

// Server Task
const startServer = (done) => {
  browserSync.init({
    server: {
      baseDir: './app'
    }
  });

  done();
}

// Watch Task
const watchTask = (done) => {
  watch(styleWatch, cssTask);
  // watch(jsWatch, browserify)
  watch(jsWatch, series(jsTask, reload));
  watch(imgWatch, series(imageTask, reload));
  watch(fontsWatch, series(fontsTask, reload));
  watch(htmlWatch, series(htmlTask, reload));

  done();
}

// Exports
exports.default = series(
  series(cssTask, jsTask, imageTask, fontsTask, htmlTask),
  series(startServer, watchTask)
)

// exports.bulid = parallel(cssTask, browserifyTask, jsTask, imageTask, fontsTask, htmlTask);