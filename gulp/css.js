/**
 * @file 兼容厂商前缀，压缩
 * @author musicode
 */

var path = require('path');

var gulp = require('gulp');
var config = require('./config');
var tool = require('./tool');


gulp.task('css', function () {

    return gulp.src(
        config.cssFiles
    )
    .pipe(
        config.filter()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});

gulp.task('css-min', function () {

    return gulp.src(
        path.join(config.outputDir, '**/*.css')
    )
    .pipe(tool.autoPrefixer())
    .pipe(tool.minifyCss())
    .pipe(
        gulp.dest(config.dest)
    );

});