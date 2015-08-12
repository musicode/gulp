/**
 * @file 编译 less
 * @author musicode
 */

var gulp = require('gulp');

var config = require('./config');
var tool = require('./tool');

gulp.task('less', function () {

    return gulp.src(
        config.lessFiles
    )
    .pipe(
        config.filter()
    )
    .pipe(
        tool.compileLess()
    )
    .pipe(
        tool.autoPrefixer()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});