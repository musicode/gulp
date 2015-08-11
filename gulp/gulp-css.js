/**
 * @file 兼容厂商前缀，压缩
 * @author musicode
 */

var path = require('path');

var gulp = require('gulp');
var config = require('./gulp-config');


var autoPrefixer = require('gulp-autoprefixer');
var compatHandler = autoPrefixer({
    browsers: [
        '> 0%',
        'last 10 version'
    ]
});


var minifyCss = require('gulp-minify-css');

var minifyHandler = minifyCss({
    compatibility: 'ie8'
});



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


gulp.task('css-source', function () {

    return gulp.src(
        path.join(config.outputDir, '**/*.css')
    )
    .pipe(compatHandler)
    .pipe(
        gulp.dest(config.dest)
    );

});

gulp.task('css-min', function () {

    return gulp.src(
        path.join(config.outputDir, '**/*.css')
    )
    .pipe(compatHandler)
    .pipe(minifyHandler)
    .pipe(
        gulp.dest(config.dest)
    );

});