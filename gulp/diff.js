/**
 * @file 通过 diff md5 区分文件是否变化
 * @author musicode
 */

/**
 * 思路如下：
 *
 * 1. 生成需要 build 的所有文件的 hashMap 和 dependencyMap
 * 2. 和上一个版本比较是否变化
 * 3. 把比较结果更新到 config.xxxFiles
 */

var path = require('path');

var gulp = require('gulp');
var ignore = require('gulp-ignore');
var sequence = require('gulp-sequence');

var config = require('./config');
var tool = require('./tool');


var amdFiles = [ ];
var jsFiles = [ ];
var lessFiles = [ ];
var stylusFiles = [ ];
var cssFiles = [ ];
var imageFiles = [ ];
var otherFiles = [ ];

/**
 * 根据 filePath 判断属于哪一个 xxFiles
 *
 * @inner
 * @param filePath
 * @return {Array.<string>?}
 */
function getFiles(filePath) {

    var files;

    switch (path.extname(filePath).toLowerCase()) {

        case '.css':
            if (tool.inFiles(filePath, config.cssFiles)) {
                files = cssFiles;
            }
            break;

        case '.less':
            if (tool.inFiles(filePath, config.lessFiles)) {
                files = lessFiles;
            }
            break;

        case '.styl':
            if (tool.inFiles(filePath, config.stylusFiles)) {
                files = stylusFiles;
            }
            break;

        case '.js':
            if (tool.inFiles(filePath, config.amdFiles)) {
                files = amdFiles;
            }
            else if (tool.inFiles(filePath, config.jsFiles)) {
                files = jsFiles;
            }
            break;

    }

    if (!files) {

        if (tool.inFiles(filePath, config.imageFiles)) {
            files = imageFiles;
        }
        else if (tool.inFiles(filePath, config.otherFiles)) {
            files = otherFiles;
        }

    }

    return files;

}

/**
 * 文件归类
 *
 * @inner
 * @param {Object} file
 * @param {Function} callback
 */
function classifyFile(file, callback) {

    var filePath = file.path;

    var files = getFiles(filePath);
    if (files) {
        files.push(filePath);
    }

    callback();

}

/**
 * 过滤叶子节点
 *
 * @inner
 * @param {Object} file
 * @return {boolean}
 */
function filterLeaf(file) {

    var noLeafMap = {
        '.js': 1,
        '.css': 1,
        '.less': 1,
        '.styl': 1
    };

    var noLeaf = noLeafMap[
        path.extname(file.path).toLowerCase()
    ];

    return !noLeaf;

}

/**
 * 比较两个版本
 *
 * @inner
 * @param {Object} file
 * @param {Function} callback
 */
function filterByCompareVersions(file, callback) {

    var prevHash = config.resourceProcessor.getFileHash(
        file,
        config.hashMap,
        config.dependencyMap
    );

    var currentHash = config.resourceProcessor.getFileHash(file);

    var filePath = file.path;

    if (currentHash && prevHash === currentHash) {

        var files = getFiles(filePath);
        if (files) {
            var index = files.indexOf(filePath);
            if (index >= 0) {
                files.splice(index, 1);
            }
        }

    }

    callback();

}


function analyzeResource(files) {
    return gulp.src(files)
    .pipe(
        config.filter()
    )
    .pipe(
        config.resourceProcessor.analyzeFileHash()
    )
    .pipe(
        config.resourceProcessor.custom(classifyFile)
    )
    .pipe(
        ignore(filterLeaf)
    )
    .pipe(
        config.resourceProcessor.analyzeFileDependencies()
    );
}

function filterResource(files) {
    return gulp.src(files)
    .pipe(
        config.filter()
    )
    .pipe(
        config.resourceProcessor.custom(filterByCompareVersions)
    );
}


gulp.task('diff-analyze', function () {
    return analyzeResource(
        tool.mergeArray(
            config.amdFiles,
            config.jsFiles,
            config.cssFiles,
            config.imageFiles,
            config.otherFiles,
            path.join(config.srcDir, '**/*.*'),
            path.join(config.depDir, '**/*.*')
        )
    );
});

gulp.task('diff-filter', function () {
    return filterResource(
        tool.mergeArray(
            config.amdFiles,
            config.jsFiles,
            config.cssFiles,
            config.imageFiles,
            config.otherFiles,
            path.join(config.srcDir, '**/*.*'),
            path.join(config.depDir, '**/*.*')
        )
    );
});

gulp.task('diff-update', function (callback) {

    config.amdFiles.length = 0;
    config.jsFiles.length = 0;
    config.lessFiles.length = 0;
    config.stylusFiles.length = 0;
    config.cssFiles.length = 0;
    config.imageFiles.length = 0;
    config.otherFiles.length = 0;

    tool.pushArray(config.amdFiles, amdFiles);
    tool.pushArray(config.jsFiles, jsFiles);
    tool.pushArray(config.lessFiles, lessFiles);
    tool.pushArray(config.stylusFiles, stylusFiles);
    tool.pushArray(config.cssFiles, cssFiles);
    tool.pushArray(config.imageFiles, imageFiles);
    tool.pushArray(config.otherFiles, otherFiles);

    callback();

});


gulp.task(
    'diff',
    sequence(
        'diff-analyze',
        'diff-filter',
        'diff-update'
    )
);

