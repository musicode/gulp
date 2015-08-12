/**
 * @file 各种工具
 * @author musicode
 */

var fs = require('fs');

var config = require('./config');

/**
 * 编译 amd
 */
exports.buildAmdModules = function () {
    return config.resourceProcessor.buildAmdModules();
};


var uglify = require('gulp-uglify');

/**
 * 压缩 js
 */
exports.minifyJs = function () {
    return uglify({
        compress: {
            warnings: false,
            // see https://github.com/ecomfe/edp/issues/230
            conditionals: false
        },
        mangle: {
            except: ['require', 'exports', 'module']
        }
    });
};


var less = require('gulp-less');

/**
 * 编译 less
 */
exports.compileLess = function () {
    return less({
        relativeUrls: true
    });
};

var gulpStylus = require('gulp-stylus');
var stylus = require('stylus');
var rider = require('rider');

/**
 * 编译 stylus
 */
exports.compileStylus = function () {
    return gulpStylus({
        'resolve url': true,
        define: {
            url: stylus.resolver()
        },
        use: rider()
    });
};


var minifyCss = require('gulp-minify-css');

/**
 * 压缩 css
 */
exports.minifyCss = function () {
    return minifyCss({
        compatibility: 'ie8'
    });
};


var autoPrefixer = require('gulp-autoprefixer');

/**
 * auto prefixer
 */
exports.autoPrefixer = function () {
    return autoPrefixer({
        browsers: [
            '> 0%',
            'last 10 version'
        ]
    });
};


var imagemin = require('gulp-imagemin');

/**
 * 压缩图片
 */
exports.minifyImage = function () {
    return imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    });
};


/**
 * 持久化 json 数据
 *
 * @param {string} file
 * @param {Object|Array} json
 */
exports.writeJSON = function (file, json) {
    fs.writeFile(
        file,
        JSON.stringify(json, null, 4)
    );
};