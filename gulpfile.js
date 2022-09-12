import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import svgstore from 'gulp-svgstore';
import csso from 'postcss-csso';
import svgo from 'gulp-svgmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import {deleteAsync} from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () =>  {
  return gulp.src('source/*.html')
    .pipe(gulp.dest('build'));
}

 // SVG
 export const svg = () => {
  return gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
 }

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({inLineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
}

// // images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'))
}

// WebP
const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh({
    webp:{}
    }))
    .pipe(gulp.dest('build/img'))
}

//scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

// Copy

const copy = (done) => {
  gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/*.ico',
  'source/manifest.webmanifest'
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//Clean

const clean = () => {
  return deleteAsync('build');
}

// Server

function server(done) {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
  }

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp
  ),
  );

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp
  ),
gulp.series(
  server,
  watcher
));
