'use strict';

const {
    series,
    parallel,
    src,
    dest,
    watch
} = require('gulp');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;

// FIXME: Vendor isn't showing up on heroku version
// TODO: Add notify.js to vendor folder for notifications

// Concat tasks
function concatScripts() {
    return src(['client/js/main.js', 'client/js/modal.js', 'client/js/themes.js'])
        .pipe(concat('bundle.min.js'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(dest('dist/'));
}

function concatStylesheets() {
    return src('client/*/**.css')
        .pipe(concat('bundle.min.css'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('/'))
        .pipe(dest('dist/'));
}

function concatVendor() {
    return src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/spectrum-colorpicker/spectrum.js'])
        .pipe(concat('vendor-bundle.min.js'))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(dest('dist/vendor/'));
}

// Copy tasks
function copyIndex() {
    return src('client/index.html')
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

// TODO: Modularize by putting repeated series/parallels into functions OR tasks (not sure which one is better)
exports.default = series(cleanAll, concatScripts, concatStylesheets, parallel(copyIndex, concatVendor, copyFavicon));
exports.concat = parallel(concatScripts, concatStylesheets);
exports.copy = parallel(copyIndex, concatVendor, copyFavicon);
exports.cleanAll = cleanAll;
exports.cleanVendor = cleanVendor;
exports.build = parallel(concatScripts, concatStylesheets, copyIndex, concatVendor, copyFavicon);
exports.watch = () => {
    watch(['client/js/**/*.js', 'client/**/*.html', 'client/css/**/*.css'], series(cleanAll, concatScripts, concatStylesheets, copyIndex, concatVendor, copyFavicon));
}