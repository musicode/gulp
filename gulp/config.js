/**
 * @file 配置
 * @author musicode
 */

var path = require('path');
var gulp = require('gulp');

var ignore = require('gulp-ignore');
var Resource = require('gulp-resource');

var tool = require('./tool');


// 项目下的所有 src 目录都会转成 asset，不限于 project/src
exports.srcName = 'src';
exports.assetName = 'asset';

// 因为 project 目录和 output 目录的处理都需要，因此声明一个变量
exports.viewName = 'view';
exports.depName = 'dep';

/**
 * 项目根目录
 *
 * @type {string}
 */
exports.projectDir = path.dirname(__dirname);

/**
 * 模板目录
 *
 * @type {string}
 */
exports.viewDir = path.join(exports.projectDir, exports.viewName);

/**
 * 项目源码目录
 *
 * @type {string}
 */
exports.srcDir = path.join(exports.projectDir, exports.srcName);

/**
 * 项目依赖库目录
 *
 * @type {string}
 */
exports.depDir = path.join(exports.projectDir, exports.depName);

/**
 * 项目编译输出目录
 *
 * @type {string}
 */
exports.outputDir = path.join(exports.projectDir, 'output');

/**
 * 静态资源哈希表
 *
 * @type {string}
 */
exports.hashMapFile = path.join(exports.projectDir, 'hash.json');

exports.hashMap = tool.readHashMapFile(exports.hashMapFile) || { };


/**
 * 静态资源依赖表
 *
 * @type {string}
 */
exports.dependencyMapFile = path.join(exports.projectDir, 'dependency.json');

exports.dependencyMap = tool.readDependencyMapFile(exports.dependencyMapFile) || { };

/**
 * 是否要 build src 目录
 *
 * @type {boolean}
 */
exports.buildSrc = true;

/**
 * 是否要 build dep 目录
 *
 * @type {boolean}
 */
exports.buildDep = true;

/**
 * 是否为上线版本
 *
 * @type {boolean}
 */
exports.release = true;

/**
 * 需要 build 的 html 文件
 *
 * @type {Array}
 */
exports.htmlFiles = [

];

if (exports.buildSrc) {
    exports.htmlFiles.push(
        path.join(exports.viewDir, '**/*.html')
    );
}

/**
 * 需要 build 的 less 文件
 *
 * @type {Array}
 */
exports.lessFiles = [

];

//if (exports.buildSrc) {
//    exports.lessFiles.push(
//        path.join(exports.srcDir, 'css/common/component/wechatQrcode.less')
//    );
//}

/**
 * 需要 build 的 stylus 文件
 *
 * @type {Array}
 */
exports.stylusFiles = [

];

/**
 * 需要 build 的 css 文件
 *
 * @type {Array}
 */
exports.cssFiles = [

];

if (exports.buildDep) {
    exports.cssFiles.push(
        path.join(exports.depDir, '**/*.css')
    );
}

/**
 * 需要 build 的非 amd js 文件
 *
 * @type {Array}
 */
exports.jsFiles = [

];

//if (exports.buildSrc) {
//    exports.jsFiles.push(
//        path.join(exports.projectDir, 'tool/cert.js')
//    );
//}

if (exports.buildDep) {
    exports.jsFiles.push(
        path.join(exports.depDir, 'base/**/*.js'),
        path.join(exports.depDir, 'webAnalysis/**/*.js'),
        path.join(exports.depDir, 'excanvas/**/*.js'),
        path.join(exports.depDir, 'webSocket/**/*.js')
//        path.join(exports.depDir, 'im/**/*.js'),
//        path.join(exports.depDir, 'echarts/**/*.js'),
//        path.join(exports.depDir, 'ueditor/**/*.js')
    );
}

/**
 * 需要 build 的 amd js 文件
 *
 * @type {Array}
 */
exports.amdFiles = [

];

if (exports.buildSrc) {
    exports.amdFiles.push(
//        path.join(exports.srcDir, 'common/*.js'),
//        path.join(exports.srcDir, 'common/*/*.js')
    );
}

if (exports.buildDep) {
    exports.amdFiles.push(
       path.join(exports.depDir, 'cobble/**/*.js'),
       path.join(exports.depDir, 'painter/**/*.js'),
       path.join(exports.depDir, 'TextClipboard/**/*.js'),
       path.join(exports.depDir, 'zlib/**/*.js')

//        path.join(exports.depDir, 'moment/**/*.js'),
//        path.join(exports.depDir, 'imageCrop/**/*.js'),
//        path.join(exports.depDir, 'audioPlayer/**/*.js'),
//        path.join(exports.depDir, 'underscore/**/*.js')
    );
}

/**
 * 需要 build 的图片
 *
 * @type {Array}
 */
exports.imageFiles = [

];

var imageFiles = [
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.gif',
    '**/*.cur',
    '**/*.ico'
];

if (exports.buildSrc) {
    imageFiles.forEach(function (file) {
        exports.imageFiles.push(
            path.join(exports.srcDir, file)
        );
    });
}

if (exports.buildDep) {
    imageFiles.forEach(function (file) {
        exports.imageFiles.push(
            path.join(exports.depDir, file)
        );
    });
}

/**
 * 其他的静态资源，比如 swf txt pdf word
 *
 * @type {Array}
 */
exports.otherFiles = [

];

var otherFiles = [
    '**/*.html',
    '**/*.swf',
    '**/*.txt',
    '**/*.flv',
    '**/*.mp4',
    '**/*.mp3',
    '**/*.pdf',
    '**/*.json',
    '**/*.eot',
    '**/*.svg',
    '**/*.ttf',
    '**/*.woff'
];

if (exports.buildSrc) {
    otherFiles.forEach(function (file) {
        exports.otherFiles.push(
            path.join(exports.srcDir, file)
        );
    });
}

if (exports.buildDep) {
    otherFiles.forEach(function (file) {
        exports.otherFiles.push(
            path.join(exports.depDir, file)
        );
    });
}

/**
 * 需要过滤的文件
 *
 * @type {Array}
 */
exports.filterFiles = [
    '**/test/**/*',
    '**/testcases/**/*',
    '**/doc/**/*',
    '**/demo/**/*',
    '**/demo-files/**/*',
    '**/*.as',
    '**/*.psd',
    'edp-*'
];

/**
 * 文件是否需要 build
 *
 * @return {Function}
 */
exports.filter = function () {

    return ignore.exclude(exports.filterFiles);

};

/**
 * 转换路径，把 src 替换成 asset，把 less styl 替换成 css
 *
 * @param {string} filePath
 * @return {string}
 */
exports.replaceResource = (function () {

    // 避免把 /path/srcabc/ 替换成 /path/assetabc/
    var pattern = new RegExp(
        '\b?' + exports.srcName + '\b?',
        'g'
    );

    var extMap = {
        '.less': '.css',
        '.styl': '.css'
    };

    return function (filePath) {

        filePath = filePath.replace(
            pattern,
            function ($0) {
                return $0.replace(exports.srcName, exports.assetName);
            }
        );

        var fileExt = path.extname(filePath).toLowerCase();
        if (extMap[fileExt]) {
            filePath = path.join(
                path.dirname(filePath),
                path.basename(filePath, fileExt) + extMap[fileExt]
            );
        }

        return filePath;

    };

})();

/**
 * 转换 amd loader 配置
 *
 * @param {Object} data
 * @return {Object}
 */
exports.replaceRequireConfig = function (data) {

    var config = { };

    for (var key in data) {
        config[key] = data[key];
    }

    if (data.baseUrl) {
        config.baseUrl = exports.replaceResource(data.baseUrl);
    }

    var paths = data.paths;
    if (paths) {

        config.paths = { };

        for (var key in paths) {
            config.paths[key] = paths[key].indexOf('http') === 0
                              ? paths[key]
                              : exports.replaceResource(paths[key]);
        }
    }

    var packages = data.packages;
    if (packages) {

        config.packages = [ ];

        packages.forEach(function (pkg) {
            config.packages.push({
                name: pkg.name,
                main: pkg.main,
                location: pkg.location.indexOf('http') === 0
                        ? pkg.location
                        : exports.replaceResource(pkg.location)
            })
        });

    }

    return config;

};

/**
 * 静态资源处理器
 */
exports.resourceProcessor = (function () {

    // 错误的文件路径
    var errorFilePattern = /[$ {}]/;

    /*
     * amd 打包策略
     *
     * 格式如下
     *
     * {
     *    // 全局要合并的模块
     *    include: [
     *        'modudle'
     *    ],
     *    // 全局不合并的模块
     *    exclude: [
     *        'module'
     *    ],
     *    // 模块默认按自己的依赖进行合并
     *    // 只有配置成 false 才表示不需要合并
     *    // 每个模块还可以配置 include 和 exclude，优先级比全局 include exclude 更高
     *    modules: {
     *        module: {
     *            include: [ ],
     *            exclude: [ ]
     *        }
     *    }
     * }
     */

    var amdConfig = {
        paths: { },
        packages: [
            {
                name: 'cobble',
                location: '../dep/cobble/0.3.13/src'
            },
            {
                name: 'painter',
                location: '../dep/painter/0.0.1/src'
            },
            {
                name: 'zlib',
                location: '../dep/zlib/0.0.1/src'
            },
            {
                name: 'TextClipboard',
                location: '../dep/TextClipboard/0.0.3/src',
                main: 'TextClipboard'
            }
        ]
    };

    var depAmdConfig = {
        baseUrl: exports.srcDir,
        paths: amdConfig.paths,
        packages: amdConfig.packages
    };

    var srcAmdConfig = {
        baseUrl: exports.srcDir,
        paths: amdConfig.paths,
        packages: amdConfig.packages,
        combine: {

            exclude: [
                'echarts',
                'echarts/**/*',
                // 'cobble',
                // 'cobble/**/*',
                'zlib',
                'moment',
                'imageCrop',
                'audioPlayer',
                'underscore',
                'TextClipboard'
            ]

        },
        replaceRequireResource: function (raw, absolute) {

            // 把 less stylus 改成 css
            var extName = path.extname(raw);

            switch (extName.toLowerCase()) {
                case '.less':
                case '.styl':
                    raw = path.join(
                        path.dirname(raw),
                        path.basename(raw, extName) + '.css'
                    );
                    break;
            }

            return raw;

        },
        replaceRequireConfig: function (data) {
            return exports.replaceRequireConfig(data);
        }
    };

    var assetAmdConfig = exports.replaceRequireConfig(srcAmdConfig);
    assetAmdConfig.baseUrl = path.join(exports.outputDir, exports.assetName);
    assetAmdConfig.combine = { };

    var inDirectory = function (dir, file) {
        return path.relative(dir, file).indexOf('..') < 0;
    };

    /**
     * 根据文件路径获取不同的 amd config
     *
     * @inner
     * @param {string} filePath
     * @return {Object}
     */
    var getAmdConfig = function (filePath) {

        var amdConfig;

        if (inDirectory(exports.outputDir, filePath)) {
            amdConfig = assetAmdConfig;
        }
        else {
            if (inDirectory(exports.depDir, filePath)) {
                amdConfig = depAmdConfig;
            }
            else {
                amdConfig = srcAmdConfig;
            }
        }

        amdConfig.minify = exports.release;

        return amdConfig;

    };

    /**
     * 改写文件名，添加 hash 后缀
     *
     * @inner
     * @param {string} filePath
     * @param {string} hash
     * @return {string}
     */
    var appendFileHash = function (filePath, hash) {

        var extName = path.extname(filePath);

        return path.join(
            path.dirname(filePath),
            path.basename(filePath, extName) + '_' + hash + extName
        );

    };



    var instance = new Resource({
        getAmdConfig: getAmdConfig,
        renameFile: function (file, hash) {

            var filePath = file.path;

            if (hash) {
                filePath = appendFileHash(filePath, hash);
            }

            return exports.replaceResource(filePath);

        },
        renameDependency: function (file, fileHash, dependency, dependencyHash) {

            var filePath = dependency.raw;

            if (dependencyHash) {
                // 只有 asset 目录下的不加 md5 的文件才不加
                if (!inDirectory(path.join(exports.outputDir, exports.assetName), file.path)
                    || file.path.indexOf(fileHash) > 0
                ) {
                    filePath = appendFileHash(filePath, dependencyHash);
                }
            }

            return exports.replaceResource(filePath);

        },
        filterDependency: function (file, dependency) {
            if (errorFilePattern.test(dependency.absolute)) {
                console.log('[INFO][error dependency]');
                console.log(dependency);
                return true;
            }
        },
        correctDependency: function (file, dependency) {

            var absolute = dependency.absolute;
            var extname = path.extname(file.path).toLowerCase();

            var inSrc = inDirectory(exports.srcDir, file.path);
            var inOutput;

            if (!inSrc) {
                inOutput = inDirectory(exports.outputDir, file.path);
            }

            if (inSrc && extname === '.styl') {

                absolute = path.join(
                    exports.srcDir,
                    dependency.raw
                );

            }
            else {

                var rootDir = inOutput
                            ? exports.outputDir
                            : exports.projectDir;

                var srcDir = inOutput
                           ? path.join(exports.outputDir, exports.assetName)
                           : exports.srcDir;

                var customPrefixs = {
                    '{{ $static_origin }}/': rootDir,
                    '/src/': srcDir
                };

                for (var prefix in customPrefixs) {
                    if (absolute.indexOf(prefix) === 0) {
                        absolute = path.join(
                            customPrefixs[prefix],
                            absolute.substr(prefix.length)
                        );
                        break;
                    }
                }
            }

            if (inOutput) {
                absolute = exports.replaceResource(absolute);
            }

            dependency.absolute = absolute;

        },
        htmlRules: [
            {
                // 匹配如下格式：
                // {{ $amd_modules = 'xx' }}
                // {{ $amd_modules = [ 'xx', 'yy' ] }}
                // {{ $amd_modules[] = 'xx' }}
                pattern: /\{\{ \$(?:amd_modules|amd_more|script_path)(?:\[\])?\s*=\s*([^}]+) \}\}/g,
                match: function (result, file) {
                    var terms = result.substring(3, result.length - 3).split('=');
                    return instance.parseAmdDependencies(
                        file.path,
                        result,
                        terms[1]
                    );
                }
            },
            {
                // 匹配如下格式
                // require('xx'
                // require(['xx']
                pattern: /require\s*?\(\s*?(\[?[^{}\]]+\]?)/g,
                match: function (result, file) {
                    return instance.parseAmdDependencies(
                        file.path,
                        result,
                        result.replace(/require\s*?\(/, '')
                    );
                }
            },
            {
                // 自定义替换格式
                pattern: /\$custom_path\s*=\s*['"][^'"]+['"]/g,
                match: function (result) {
                    var terms = result.split(/['"]/);
                    if (terms.length === 3) {
                        return terms[1];
                    }
                }
            }
        ]
    });

    return instance;

})();

/**
 * 根据相对路径输出文件，返回是目录路径，表示文件要输出到此目录下
 *
 * @param {Object} file
 * @return {string}
 */
exports.dest = function (file) {

    var projectDir = exports.projectDir;
    var outputDir = exports.outputDir;

    var relativePath = path.relative(outputDir, file.path);

    var baseDir = relativePath.indexOf('..') >= 0
                ? projectDir
                : outputDir;

    relativePath = exports.replaceResource(relativePath);

    file.base = baseDir;
    file.path = path.join(
        outputDir,
        relativePath
    );

    return outputDir;

};
