/**
 * @file 缓存控制
 * @author musicode
 */

/**
 * 流程如下：
 *
 * 非源码目录，用版本号控制足够了，如 jquery/1.10.0/src/jquery.js
 *
 * 1. 扫描 output/asset/ 下所有的静态资源，建立哈希表（path -> hash）
 * 2. 建立哈希表之后，先处理 js 和 css 这种分支节点，建立依赖表 （path -> dependencies）
 *
 * 基于上面这两张表，递归计算哈希完全不是问题
 *
 * 3. 递归计算的方式是递归依赖表，获取到每个依赖的哈希，相加再计算一个总哈希
 * 4. 遍历 html css js，替换引用路径
 * 5. 根据哈希表，生成对应的哈希文件，比如 a.js 变成 a_123.js
 *
 * 生成哈希文件务必最后做，这样才能减少扫描文件的量级
 */


var path = require('path');

var gulp = require('gulp');

var sequence = require('gulp-sequence');
var ignore = require('gulp-ignore');

var config = require('./config');
var tool = require('./tool');



var resourceProcessor = config.resourceProcessor;

var assetDir = path.join(config.outputDir, config.assetName);


function toOutputFiles(files) {

    var result = [ ];

    files.forEach(function (file) {

        if (file.indexOf(config.projectDir) === 0) {
            result.push(
                file.replace(config.projectDir, config.outputDir)
            );
        }

    });

    return result;

}

/**
 * 把 srcDir 的文件转到 assetDir
 *
 * @inner
 * @param {Array.<string>} files
 * @return {Array.<string>}
 */
function toAssetFiles(files) {

    var result = [ ];

    files.forEach(function (file) {

        if (file.indexOf(config.srcDir) === 0) {
            result.push(
                file.replace(config.srcDir, assetDir)
            );
        }

    });

    return result;

}


gulp.task('version-merge-prev', function (callback) {

    var prevHashMap = config.hashMap;
    var prevDependencyMap = config.dependencyMap;

    var currentHashMap = resourceProcessor.hashMap;
    var currentDependencyMap = resourceProcessor.dependencyMap;

    tool.extend(
        currentHashMap,
        prevHashMap
    );

    tool.extend(
        currentDependencyMap,
        prevDependencyMap
    );

    callback();

});


// 生成 hash 文件后，静态资源目录至少有两个版本
// 如 a.js 和 a_sdfs.js，这时要挑出哈希后的文件做引用替换
var htmlFiles = [ ];
var amdFiles = [ ];
var cssFiles = [ ];
var hashAmdFiles = [ ];
var hashCssFiles = [ ];


// 扫描 assetDir，建立全量静态资源哈希表和依赖表
gulp.task('version-calculate', function (callback) {

    var outputHtmlFiles = toOutputFiles(config.htmlFiles);
    var assetAmdFiles = toAssetFiles(config.amdFiles);

    var getFiles = function (filePath, hasHash) {

        var files;

        switch (path.extname(filePath).toLowerCase()) {

            case '.js':
                if (tool.inFiles(filePath, assetAmdFiles)) {
                    files = hasHash ? hashAmdFiles : amdFiles;
                }
                break;

            case '.css':
                files = hasHash ? hashCssFiles : cssFiles;
                break;

            default:
                if (tool.inFiles(filePath, outputHtmlFiles)) {
                    files = htmlFiles;
                }
                break;
        }

        return files;

    };

    var hasHashMap = false;
    var hasDenpendencyMap = false;

    var hashMapReady = function () {
        hasHashMap = true;
        mapReady();
    };

    var dependencyMapReady = function () {
        hasDenpendencyMap = true;
        mapReady();
    };

    var mapReady = function () {

        if (!hasHashMap || !hasDenpendencyMap) {
            return;
        }

        gulp.src(
            path.join(assetDir, '**/*')
        )
        .pipe(
            resourceProcessor.custom(
                function (file, callback) {

                    var hashFilePath = resourceProcessor.getHashFilePath(file);
                    if (hashFilePath) {
                        var files = getFiles(file.path, true);
                        if (files) {
                            files.push(hashFilePath);
                        }
                    }

                    callback();

                }
            )
        )
        .pipe(
            resourceProcessor.renameFiles()
        )
        .pipe(
            gulp.dest(config.dest)
        )
        .once('end', replaceDependencies);

    };

    var replaceDependencies = function () {

        gulp.src(
            tool.mergeArray(htmlFiles, hashAmdFiles, hashCssFiles)
        )
        .pipe(
            resourceProcessor.replaceFileDependencies({
                customReplace: function (file, content) {

                    var extname = path.extname(file.path).toLowerCase();
                    if (extname !== '.html') {
                        return;
                    }

                    var list = resourceProcessor.parseAmdConfig(content);

                    if (Array.isArray(list) && list.length > 0) {

                        var parts = [ ];
                        var fromIndex = 0;

                        list.forEach(function (item, index) {

                            parts.push(
                                content.substring(fromIndex, item.fromIndex)
                            );

                            var code;

                            if (item.data) {
                                code = JSON.stringify(
                                    config.replaceRequireConfig(item.data),
                                    null,
                                    item.indentBase
                                );
                            }
                            else {
                                code = content.substring(
                                    item.fromIndex,
                                    item.toIndex
                                );
                            }

                            parts.push(code);

                            fromIndex = item.toIndex;

                        });

                        parts.push(
                            content.substring(fromIndex)
                        );

                        return parts.join('');

                    }
                }
            })
        )
        .pipe(
            gulp.dest(config.dest)
        )
        .once('end', callback);

    };

    var allFiles = gulp.src(
        tool.mergeArray(
            outputHtmlFiles,
            path.join(assetDir, '**/*.*')
        )
    )
    .pipe(
        resourceProcessor.custom(
            function (file, callback) {

                var files = getFiles(file.path);
                if (files) {
                    files.push(file.path)
                }

                callback();

            }
        )
    );

    var assetFiles = allFiles
    .pipe(
        ignore.exclude(function (file) {
            return file.path.indexOf(assetDir) !== 0;
        })
    )
    .pipe(
        resourceProcessor.analyzeFileHash()
    )
    .once('end', hashMapReady);

    var amdCssFiles = assetFiles
    .pipe(
        ignore.exclude(function (file) {
            return amdFiles.indexOf(file.path) < 0
                && cssFiles.indexOf(file.path) < 0;
        })
    )
    .pipe(
        resourceProcessor.analyzeFileDependencies()
    )
    .once('end', dependencyMapReady);


});


gulp.task('version-write-file', function (callback) {

    tool.writeHashMapFile(
        resourceProcessor.hashMap
    );

    tool.writeDependencyMapFile(
        resourceProcessor.dependencyMap
    );

    if (config.release) {
        return gulp.src(
            hashAmdFiles
        )
        .pipe(
            tool.minifyJs()
        )
        .pipe(
            gulp.dest(config.dest)
        );
    }

    callback();

});

gulp.task(
    'version',
    sequence(
        'version-merge-prev',
        'version-calculate',
        'version-write-file'
    )
);

