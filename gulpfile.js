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
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;


// TODO: Maybe I can add spectrum as a package instead of the raw files (js specifically, not css)
// Concat & uglify tasks
function concatScripts() {
    return src(['client/js/main.js', 'client/js/modal.js', 'client/spectrum/spectrum.js', 'client/js/themes.js'])
        .pipe(concat('concat.min.js'), {
            newLine: '\n'
        })
        .pipe(rename('bundle.min.js'))
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
        .pipe(cleanCSS())
        .pipe(dest('dist/'));
}

// Copy tasks
function copyIndex() {
    return src('client/index.html')
        .pipe(dest('dist/'));
}

function copyVendor() {
    return src('node_modules/jquery/dist/jquery.min.js')
        .pipe(dest('dist/vendor/'));
}

function copyFavicon() {
    return src('client/favicon/*')
        .pipe(dest('dist/favicon'));
}

// Clean tasks
function cleanAll() {
    return del('dist/');
}

function cleanVendor() {
    return del('dist/vendor');
}

// Watch tasks
watch(['client/js/**/*.js', 'client/**/*.html', 'client/css/**/*.css', 'client/spectrum/**/*.css'], () => {
    return series(cleanAll, concatScripts, concatStylesheets),
        parallel(copyIndex, copyVendor, copyFavicon);
});

// TODO: Modularize by putting repeated series/parallels into functions OR tasks (not sure which one is better)
exports.default = series(cleanAll, concatScripts, concatStylesheets, parallel(copyIndex, copyVendor, copyFavicon));
exports.concat = parallel(concatScripts, concatStylesheets);
exports.copy = parallel(copyIndex, copyVendor, copyFavicon);
exports.cleanAll = cleanAll;
exports.cleanVendor = cleanVendor;
exports.build = parallel(concatScripts, concatStylesheets, copyIndex, copyVendor, copyFavicon);
exports.watch = () => {
    watch(['client/js/**/*.js', 'client/**/*.html', 'client/css/**/*.css', 'client/spectrum/**/*.css'], series(cleanAll, concatScripts, concatStylesheets, copyIndex, copyVendor, copyFavicon));
}