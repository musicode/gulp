
var path = require('path');

var gulp = require('gulp');
var sequence = require('gulp-sequence');

var config = require('./gulp/config');
var tool = require('./gulp/tool');

require('./gulp/clean');
require('./gulp/html');
require('./gulp/amd');
require('./gulp/js');
require('./gulp/less');
require('./gulp/stylus');
require('./gulp/css');
require('./gulp/image');
require('./gulp/other');
require('./gulp/version');


gulp.task(
    'env-source',
    function () {
        config.release = false;
    }
);

gulp.task(
    'env-min',
    function () {
        config.release = true;
    }
);

gulp.task(
    'source',
    sequence(
        'env-source',
        'clean',
        'html',
        ['amd', 'js', 'less', 'stylus', 'css', 'image', 'other'],
        'version'
    )
);

gulp.task(
    'min',
    sequence(
        'env-min',
        'clean',
        'html',
        ['amd', 'js', 'less', 'stylus', 'css', 'image', 'other'],
        'version'
    )
);

gulp.task(
    'end',
    function (callback) {

        var writeFile = function (name, json) {

            tool.writeJSON(
                path.join(config.outputDir, name),
                json
            );

        };

        writeFile('html.json', config.htmlFiles);
        writeFile('js.json', config.jsFiles);
        writeFile('amd.json', config.amdFiles);
        writeFile('css.json', config.cssFiles);
        writeFile('less.json', config.lessFiles);
        writeFile('stylus.json', config.stylusFiles);
        writeFile('image.json', config.imageFiles);

        callback();

    }
);

gulp.task('test', ['source']);
gulp.task('beta', ['min']);

gulp.task('default', ['source']);
