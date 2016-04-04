var path = require('path');

module.exports = function(config) {
    config.includeConfig('enb-bevis-helper');

    var browserSupport = [
        'IE >= 9',
        'Safari >= 7',
        'Chrome >= 33',
        'Opera >= 12.16',
        'Firefox >= 28'
    ];

    var bevisHelper = config.module('enb-bevis-helper')
        .browserSupport(browserSupport)
        .useAutopolyfiller();

    config.setLanguages(['ru']);

    // Эти директории — для сборки HTML-шаблонов.
    // В них получается куча файлов, но нам нужны только `?.js` и `module.js`-файлы.
    config.nodes('build/api/layouts/*', function (nodeConfig) {
        nodeConfig.addTechs([
            [require('enb-bevis/techs/deps')],
            require('enb-bevis/techs/files'),
            require('enb-bevis/techs/sources'),

            [require('enb-y-i18n/techs/y-i18n-lang-js'), {lang: '{lang}'}],

            require('enb-bt/techs/bt-server'),
            [require('enb-bt/techs/bt-client-module'), {useSourceMap: true}],

            // HTML
            [require('enb/techs/file-provider'), {target: '?.btjson.js'}],
            require('enb-bevis/techs/source-deps-from-btjson'),
            [require('enb-bt/techs/html-from-btjson'), {lang: '{lang}', target: '?.tmp'}]
        ]);

        // YMAPS TECHS
        nodeConfig.addTechs([
            require('./techs/ymaps-module-deps'),
            require('./techs/ymaps-module-from-html'),
            require('./techs/ymaps-layout-module')
        ]);

        nodeConfig.addTargets([
            '?',
            '?.tmp',
            'module.json'
        ]);
    });

    // Эта директория нужна для того, чтобы собрать вместе зависимости всех HTML-шаблонов.
    config.node('build/api/common', function (nodeConfig) {
        var layoutNodes = Object.keys(config.getNodeConfigs()).filter(function (nodePath) {
            return nodePath.indexOf('build/api/layouts/') === 0;
        });

        var fileNames = [];

        // Сборка YAML файлов из всех собранных лейаутов.
        nodeConfig.addTechs(layoutNodes.map(function (nodePath) {
            var fileName = path.basename(nodePath) + '.deps.yaml';
            fileNames.push(fileName);

            return [require('./techs/cross-node-copy'), {
                sourceNodePath: nodePath,
                sourceTarget: fileName,
                destTarget: fileName
            }];
        }));
        nodeConfig.addTargets(fileNames);

        // Объединение и раскрытие зависимостей.
        nodeConfig.addTechs([
            [require('enb/techs/file-merge'), {target: '?.ymaps-deps.yaml', sources: fileNames}],
            require('enb-bevis/techs/sources')
        ]);

        nodeConfig.addTargets([
            "?.ymaps-deps.yaml"
        ]);
    });

    config.node('build/api/fragments', function (nodeConfig) {
        nodeConfig.addTechs([   
            [require('./techs/cross-node-copy'), {
                sourceNodePath: 'build/api/common',
                sourceTarget: 'common.ymaps-deps.yaml',
                destTarget: 'common.ymaps-deps.yaml'
            }],

            require('enb-bevis/techs/sources'),
            require('enb-bevis/techs/files'),
            [require('enb-bevis/techs/deps'), {
                sourceDepsFile: 'common.ymaps-deps.yaml',
                target: '?.dest-deps.js'
            }],

            require('./techs/ymaps-module-deps'),
            [require('./techs/ymaps--fragments'), {
                sourceTarget: '?.ymaps-deps.js'
            }],
            [require('enb-stylus/techs/css-stylus-with-autoprefixer'), {
                browsers: browserSupport,
                target: '?.css',
                variables: {ie: false}
            }]
        ]);

        nodeConfig.addTargets([
            "?.fragments"
        ]);
    });
};
