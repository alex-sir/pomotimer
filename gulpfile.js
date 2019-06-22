'use strict';

const {
    series,
    parallel,
    src,
    dest,
    watch,
    task
} = require('gulp');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const insert = require('gulp-insert');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const scripts = ['client/js/**/*.js'];
// TODO: Get rid of vendor and switch to browserify (if possible)
const vendorScripts = ['node_modules/jquery/dist/jquery.min.js', 'node_modules/spectrum-colorpicker/spectrum.js', 'node_modules/push.js/bin/push.min.js', 'node_modules/push.js/bin/serviceWorker.min.js', 'node_modules/rgb-hex/index.js'];
const watchGlobs = ['client/js/**/*.js', 'client/**/*.html', 'client/css/**/*.css'];

// Concat tasks
function concatScripts() {
    return src(scripts)
        .pipe(concat('bundle.min.js'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
}

function concatScriptsProduction() {
    return src(scripts)
        .pipe(concat('bundle.min.js'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(insert.transform((contents) => {
            return `(function(){${contents}})();`;
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
}

function concatStylesheets() {
    return src('client/*/**.css')
        .pipe(concat('bundle.min.css'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
}

function concatVendor() {
    return src(vendorScripts)
        .pipe(concat('vendor-bundle.min.js'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/vendor/'));
}

// Copy tasks
function copyIndex() {
    return src('client/index.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('dist/'));
}

function copyFavicon() {
    return src('client/favicon/*')
        .pipe(dest('dist/favicon'));
}

// Clean tasks
function cleanAll() {
    return del(['dist/*', '!dist/.git']);
}

function cleanVendor() {
    return del('dist/vendor');
}

// Development
task('concat', parallel(concatScripts, concatStylesheets));
task('copy', parallel(copyIndex, concatVendor, copyFavicon));
task('build', parallel('concat', 'copy'));
exports.cleanAll = cleanAll;
exports.cleanVendor = cleanVendor;
task('default', series(cleanAll, 'build'));
exports.watch = () => {
    watch(watchGlobs, parallel('default'));
}

// Production
task('concatProduction', parallel(concatScriptsProduction, concatStylesheets));
task('buildProduction', parallel('concatProduction', 'copy'));
task('production', series(cleanAll, 'buildProduction'));