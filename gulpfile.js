'use strict';

const {
    series,
    parallel,
    src,
    dest,
    watch,
    task
} = require('gulp');
const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const insert = require('gulp-insert');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const scripts = ['client/js/*.js'];
const vendorScripts = [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/spectrum-colorpicker/spectrum.js',
    'client/js/vendor/rgb-hex.js',
    'node_modules/screenfull/dist/screenfull.js',
    'client/js/vendor/hex-to-rgba.js'
];
const stylesheets = [
    'client/assets/fonts/inconsolata/stylesheet.css',
    'client/assets/icons/line-awesome.min.css',
    'client/css/**/*.css'
];
const watchGlobs = ['client/**/*.html', 'client/css/**/*.css', 'client/js/**/*.js'];

// Concat tasks
function concatScripts() {
    return src(scripts)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('bundle.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
}

function concatScriptsProduction() {
    return src(scripts)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('bundle.min.js'))
        .pipe(insert.transform((contents) => {
            return `(function(){${contents}})();`;
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
}

function concatStylesheets() {
    return src(stylesheets)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(postcss([autoprefixer()]))
        .pipe(concat('bundle.min.css'))
        .pipe(cleanCSS({
            level: {
                1: {
                    specialComments: 0
                }
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'));
}

function concatVendor() {
    return src(vendorScripts)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('vendor-bundle.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/vendor/'));
}

function concatVendorProduction() {
    return src(vendorScripts)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('vendor-bundle.min.js'))
        .pipe(insert.transform((contents) => {
            return `(function(){${contents}})();`;
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/vendor/'));
}

// Copy tasks
function copyIndex() {
    return src('client/index.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest('dist/'));
}

function copyFavicon() {
    return src('client/assets/favicon/*')
        .pipe(dest('dist/assets/favicon'));
}

function copyImg() {
    return src('client/assets/img/*')
        .pipe(imagemin())
        .pipe(dest('dist/assets/img'));
}

function copyFonts() {
    return src('client/assets/fonts/**/**')
        .pipe(dest('dist/assets/fonts'))
}

function copyIcons() {
    return src('client/assets/icons/**/*')
        .pipe(dest('dist/assets/icons'));
}

function copySound() {
    return src('client/assets/sound/*')
        .pipe(dest('dist/assets/sound'));
}

// Clean tasks
function cleanAll() {
    return del(['dist/*', '!dist/.git', '!dist/CNAME']);
}

function cleanVendor() {
    return del('dist/vendor');
}

// Development
task('concat', parallel(concatScripts, concatStylesheets));
task('copy', parallel(copyIndex, concatVendor, copyFavicon, copyImg, copyFonts, copyIcons, copySound));
task('build', parallel('concat', 'copy'));
exports.cleanAll = cleanAll;
exports.cleanVendor = cleanVendor;
task('default', series(cleanAll, 'build'));
exports.watch = () => {
    watch(watchGlobs, parallel('default'));
}

// Production
task('concatProduction', parallel(concatScriptsProduction, concatStylesheets, concatVendorProduction));
task('buildProduction', parallel('concatProduction', 'copy'));
task('production', series(cleanAll, 'buildProduction'));