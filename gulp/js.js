/**
 * @file 压缩 js
 * @author musicode
 */

var path = require('path');

var gulp = require('gulp');

var config = require('./config');
var tool = require('./tool');

gulp.task('js', function () {

    return gulp.src(
        config.jsFiles
    )
    .pipe(
        config.filter()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});


gulp.task('js-min', function () {

    return gulp.src(
        path.join(config.outputDir, '**/*.js')
    )
    .pipe(
        tool.minifyJs()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});