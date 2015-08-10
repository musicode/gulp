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


var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var config = require('./gulp-config');

var sequence = require('gulp-sequence');

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

/**
 * 相对 projectDir 才方便项目转移
 *
 * @inner
 * @param {string} file
 * @return {string}
 */
function relativeProjectFile(file) {
    return path.relative(config.projectDir, file);
}

/**
 * 持久化 json 数据
 *
 * @inner
 * @param {string} file
 * @param {Object|Array} json
 */
function writeJSON(file, json) {
    fs.writeFile(
        file,
        JSON.stringify(json, null, 4)
    );
}


// 扫描 assetDir，建立全量静态资源哈希表
gulp.task('create-hash-map', function () {

    return gulp.src(
        path.join(assetDir, '**/*.*')
    )
    .pipe(
        resourceProcessor.analyzeFileHash()
    );

});

// 扫描 assetDir，建立 amd 模块依赖表
gulp.task('create-amd-dependency-map', function () {
    return gulp.src(
        toAssetFiles(config.amdFiles)
    )
    .pipe(
        resourceProcessor.analyzeFileDependencies({
            type: 'amd'
        })
    );
});

// 扫描 assetDir，建立 css 依赖表
gulp.task('create-css-dependency-map', function () {
    return gulp.src(
        path.join(assetDir, '**/*.css')
    )
    .pipe(
        resourceProcessor.analyzeFileDependencies({
            type: 'css'
        })
    );
});

// 替换 html 中的引用
gulp.task('replace-html-dependency', function () {
    return gulp.src(
        path.join(config.outputDir, config.viewName, '**/*.html')
    )
    .pipe(
        resourceProcessor.replaceFileDependencies({
            type: 'html',
            customReplace: function (content, filePath) {

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

gulp.task('replace-amd-dependency', function () {
    return gulp.src(
        toAssetFiles(config.amdFiles)
    )
    .pipe(
        resourceProcessor.replaceFileDependencies({
            type: 'amd'
        })
    )
    .pipe(
        gulp.dest(config.dest)
    );
});

gulp.task('replace-css-dependency', function () {
    return gulp.src(
        path.join(assetDir, '**/*.css')
    )
    .pipe(
        resourceProcessor.replaceFileDependencies({
            type: 'css'
        })
    )
    .pipe(
        gulp.dest(config.dest)
    );
});

gulp.task('create-hashed-file', function () {
    return gulp.src(
        path.join(assetDir, '**/*.*')
    )
    .pipe(
        resourceProcessor.renameFiles()
    )
    .pipe(
        gulp.dest(config.dest)
    );
});

// 上面这些 task 必须按下面的顺序执行
gulp.task(
    'version-batch',
    sequence(
        'create-hash-map',
        ['create-amd-dependency-map', 'create-css-dependency-map'],
        ['replace-html-dependency', 'replace-amd-dependency', 'replace-css-dependency'],
        'create-hashed-file'
    )
);

gulp.task(
    'version',
    ['version-batch'],
    function (callback) {

        if (!config.buildSrc) {
            callback();
            return;
        }

        var hashMap = resourceProcessor.hashMap;
        var data = { };

        for (var key in hashMap) {
            data[ relativeProjectFile(key) ] = hashMap[ key ];
        }

        writeJSON(config.hashMapFile, data);


        data = { };

        var dependencyMap = resourceProcessor.dependencyMap;

        for (var key in dependencyMap) {
            data[ relativeProjectFile(key) ] = dependencyMap[ key ].map(
                relativeProjectFile
            );
        }

        writeJSON(config.dependencyMapFile, data);

        callback();

    }
);

