
var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var sequence = require('gulp-sequence');

var config = require('./gulp/gulp-config');

require('./gulp/gulp-clean');
require('./gulp/gulp-html');
require('./gulp/gulp-amd');
require('./gulp/gulp-js');
require('./gulp/gulp-less');
require('./gulp/gulp-stylus');
require('./gulp/gulp-css');
require('./gulp/gulp-image');
require('./gulp/gulp-other');
require('./gulp/gulp-version');


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
        'version',
        'css-source'
    )
);

gulp.task(
    'min',
    sequence(
        'env-min',
        'clean',
        'html',
        ['amd', 'js', 'less', 'stylus', 'css', 'image', 'other'],
        'version',
        ['css-min', 'js-min']
    )
);

gulp.task(
    'end',
    function (callback) {

        var writeFile = function (name, json) {

            config.writeJSON(
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
