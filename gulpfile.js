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
const uglify = require('gulp-uglify-es').default;

// concat & uglify tasks
function concatScripts() {
    return src(['client/js/main.js', 'client/js/modal.js', 'client/spectrum/spectrum.js', 'client/js/themes.js'])
        .pipe(concat('concat.min.js'), {
            newLine: '\n'
        })
        .pipe(rename('bundle.min.js'))
        .pipe(uglify())
        .pipe(dest('public/'));
}

function concatStylesheets() {
    return src('client/*/**.css')
        .pipe(concat('bundle.min.css'))
        .pipe(cleanCSS())
        .pipe(dest('public/'));
}

// copy tasks
function copyPublicHTML() {
    return src('client/public.html')
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

exports.default = series(cleanAll, concatScripts, concatStylesheets, parallel(copyPublicHTML, copyVendor, copyFavicon));
exports.concat = parallel(concatScripts, concatStylesheets);
exports.copy = parallel(copyPublicHTML, copyVendor, copyFavicon);
exports.cleanAll = cleanAll;
exports.cleanVendor = cleanVendor;
exports.build = parallel(concatScripts, concatStylesheets, copyPublicHTML, copyVendor, copyFavicon);