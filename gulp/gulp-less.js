/**
 * @file 编译 less
 * @author musicode
 */

var gulp = require('gulp');
var config = require('./gulp-config');

var less = require('gulp-less');

var compileHandler = less({
    relativeUrls: true
});

gulp.task('less', function () {

    return gulp.src(
        config.lessFiles
    )
    .pipe(compileHandler)
    .pipe(
        gulp.dest(config.dest)
    );

});