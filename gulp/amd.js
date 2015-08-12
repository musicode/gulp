/**
 * @file amd 模块打包合并
 * @author musicode
 */

var gulp = require('gulp');

var config = require('./config');
var tool = require('./tool');


gulp.task('amd', function () {

    return gulp.src(
        config.amdFiles
    )
    .pipe(
        config.filter()
    )
    .pipe(
        tool.buildAmdModules()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});
