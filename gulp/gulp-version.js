/**
 * @file 缓存控制
 * @author musicode
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

        // 必须是 srcDir 的文件
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
 * 持久化数据
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

// 建立静态资源哈希表
gulp.task('version-hash', function () {
    // depDir 用版本号控制缓存足够了
    return gulp.src(
        path.join(assetDir, '**/*.*')
    )
    .pipe(
        resourceProcessor.analyzeFileHash()
    );
});

// 建立静态资源依赖表
gulp.task('version-amd-dependency', function () {
    return gulp.src(
        toAssetFiles(config.amdFiles)
    )
    .pipe(
        resourceProcessor.analyzeFileDependencies({
            type: 'amd'
        })
    );
});

gulp.task('version-css-dependency', function () {
    return gulp.src(
        path.join(assetDir, '**/*.css')
    )
    .pipe(
        resourceProcessor.analyzeFileDependencies({
            type: 'css'
        })
    );
});

// 引用替换
gulp.task('version-html-replace', function () {
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

gulp.task('version-amd-replace', function () {
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

gulp.task('version-css-replace', function () {
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

// 上面这些 task 必须按下面的顺序执行
gulp.task(
    'version-batch',
    sequence(
        'version-hash',
        ['version-amd-dependency', 'version-css-dependency'],
        ['version-html-replace', 'version-amd-replace', 'version-css-replace']
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

