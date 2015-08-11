/**
 * @file 编译 stylus
 * @author musicode
 */

var gulp = require('gulp');
var config = require('./gulp-config');

var stylus = require('stylus');
var rider = require('rider');

var compileHandler = require('gulp-stylus')({
    'resolve url': true,
    define: {
        url: stylus.resolver()
    },
    use: rider()
});

gulp.task('stylus', function () {

    return gulp.src(
        config.stylusFiles
    )
    .pipe(
        config.filter()
    )
    .pipe(compileHandler)
    .pipe(
        gulp.dest(config.dest)
    );

});