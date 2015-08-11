/**
 * @file 压缩图片
 * @author musicode
 */

var path = require('path');

var gulp = require('gulp');
var imagemin = require('gulp-imagemin');

var config = require('./gulp-config');

gulp.task('image', function () {

    var stream = gulp.src(
        config.imageFiles
    )
    .pipe(
        config.filter()
    );

    // 挺耗时的
    if (config.release) {
        stream = stream.pipe(
            imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            })
        );
    }

    return stream.pipe(
        gulp.dest(config.dest)
    );

});