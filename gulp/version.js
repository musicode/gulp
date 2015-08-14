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

var config = require('./config');
var tool = require('./tool');



var resourceProcessor = config.resourceProcessor;

var assetDir = path.join(config.outputDir, config.assetName);

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



// 扫描 assetDir，建立全量静态资源哈希表
gulp.task('version-create-hash-map', function () {

    return gulp.src(
        path.join(assetDir, '**/*.*')
    )
    .pipe(
        resourceProcessor.analyzeFileHash()
    );

});

// 扫描 assetDir，建立全量静态资源依赖表
gulp.task('version-create-dependency-map', function () {

    return gulp.src(
        tool.mergeArray(
            path.join(assetDir, '**/*.css'),
            toAssetFiles(config.amdFiles)
        )
    )
    .pipe(
        resourceProcessor.analyzeFileDependencies()
    );

});

// 生成 hash 文件后，静态资源目录至少有两个版本
// 如 a.js 和 a_sdfs.js，这时要挑出哈希后的文件做引用替换
var hashAmdFiles = [ ];
var hashCssFiles = [ ];

// 生成带有 hash 后缀的静态资源文件
gulp.task('version-create-hash-file', function () {

    var assetAmdFiles = toAssetFiles(config.amdFiles);

    return gulp.src(
        path.join(assetDir, '**/*.*')
    )
    .pipe(
        resourceProcessor.custom(
            function (file, callback) {

                var hashFilePath = resourceProcessor.getHashFilePath(file);

                if (hashFilePath) {
                    switch (path.extname(hashFilePath).toLowerCase()) {

                        case '.js':
                            if (tool.inFiles(file.path, assetAmdFiles)) {
                                hashAmdFiles.push(hashFilePath);
                            }
                            break;

                        case '.css':
                            hashCssFiles.push(hashFilePath);
                            break;

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
    );

});


// 替换引用
gulp.task('version-replace-dependency', function () {
    return gulp.src(
        tool.mergeArray(
            path.join(config.outputDir, config.viewName, '**/*.html'),
            hashAmdFiles,
            hashCssFiles
        )
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
    );
});




// 上面这些 task 必须按下面的顺序执行
gulp.task(
    'version-batch',
    sequence(
        'version-create-hash-map',
        'version-create-dependency-map',
        'version-create-hash-file',
        'version-replace-dependency'
    )
);

// 外部使用这个 task
gulp.task(
    'version',
    ['version-batch'],
    function (callback) {

        var prevHashMap = config.hashMap;
        var prevDependencyMap = config.dependencyMap;

        var currentHashMap = resourceProcessor.hashMap;
        var currentDependencyMap = resourceProcessor.dependencyMap;

        tool.extend(
            prevHashMap,
            currentHashMap
        );

        tool.extend(
            prevDependencyMap,
            currentDependencyMap
        );

        tool.writeHashMapFile(
            prevHashMap
        );

        tool.writeDependencyMapFile(
            prevDependencyMap
        );

        callback();

    }
);

