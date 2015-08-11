/**
 * @file 压缩 js
 * @author musicode
 */

var path = require('path');

var gulp = require('gulp');
var config = require('./gulp-config');


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



var uglify = require('gulp-uglify');

var minifyHandler = uglify({
    compress: {
        warnings: false,
        // see https://github.com/ecomfe/edp/issues/230
        conditionals: false
    },
    mangle: {
        except: ['require', 'exports', 'module']
    }
});

gulp.task('js-min', function () {

    return gulp.src(
        path.join(config.outputDir, '**/*.js')
    )
    .pipe(minifyHandler)
    .pipe(
        gulp.dest(config.dest)
    );

});