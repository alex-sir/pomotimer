const {
    series,
    parallel,
    src,
    dest
} = require('gulp');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;

// concat & uglify tasks
function concatScripts() {
    return src(['client/js/main.js', 'client/js/modal.js', 'client/spectrum/spectrum.js', 'client/js/themes.js'])
        .pipe(concat('concat.min.js'), {
            newLine: '\n'
        })
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(dest('public/'));
}

function concatStylesheets() {
    return src('client/*/**.css')
        .pipe(concat('all.min.css'))
        .pipe(cleanCSS())
        .pipe(dest('public/'));
}

// copy tasks
function copyIndex() {
    return src('client/index.html')
        .pipe(dest('public/'));
}

function copyVendor() {
    return src('node_modules/jquery/dist/jquery.min.js')
        .pipe(dest('public/vendor/'));
}

function copyFavicon() {
    return src('client/favicon/*')
        .pipe(dest('public/favicon'));
}

// clean tasks
function cleanAll() {
    return del('public/');
}

function cleanVendor() {
    return del('public/vendor');
}

exports.default = series(cleanAll, concatScripts, concatStylesheets, parallel(copyIndex, copyVendor, copyFavicon));
exports.concat = parallel(concatScripts, concatStylesheets);
exports.copy = parallel(copyIndex, copyVendor, copyFavicon);
exports.cleanAll = cleanAll;
exports.cleanVendor = cleanVendor;
exports.build = parallel(concatScripts, concatStylesheets, copyIndex, copyVendor, copyFavicon);