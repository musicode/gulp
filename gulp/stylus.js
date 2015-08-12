/**
 * @file 编译 stylus
 * @author musicode
 */

var gulp = require('gulp');

var config = require('./config');
var tool = require('./tool');

gulp.task('stylus', function () {

    return gulp.src(
        config.stylusFiles
    )
    .pipe(
        config.filter()
    )
    .pipe(
        tool.compileStylus()
    )
    .pipe(
        tool.autoPrefixer()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});