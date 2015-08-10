/**
 * @file amd 模块打包合并
 * @author musicode
 */

var path = require('path');

var gulp = require('gulp');
var config = require('./gulp-config');

var resourceProcessor = config.resourceProcessor;

gulp.task('amd', function () {

    var amdConfig = config.amd;

    return gulp.src(
        config.amdFiles
    )
    .pipe(
        resourceProcessor.buildAmdModules()
    )
    .pipe(
        gulp.dest(config.dest)
    );

});
