/**
 * cross-node-copy
 * ===============
 *
 * Копирует *файл* в текущую ноду под нужным именем из другой ноды.
 *
 * **Опции**
 *
 * * *String* **sourceNodePath** — Путь исходной ноды с нужным файлом. Обязательная опция.
 * * *String* **sourceTarget** — Исходный таргет, который будет копироваться.
 * * *String* **destTarget** — Результирующий таргет.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech([require('./techs/cross-node-copy'), {
 *   sourceNodePath: 'build/api/common',
 *   sourceTarget: 'common.bemhtml.js',
 *   destTarget: '?.bemhtml.js'
 * }]);
 * ```
 */
var vowFs = require('enb/lib/fs/async-fs');
var inherit = require('inherit');

module.exports = inherit(require('enb/lib/tech/base-tech'), {
    getName: function () {
        return 'cross-node-copy';
    },

    configure: function () {
        this._sourceNodePath = this.getRequiredOption('sourceNodePath');
        this._sourceTarget = this.getRequiredOption('sourceTarget');
        this._target = this.node.unmaskTargetName(this.getRequiredOption('destTarget'));
    },

    getTargets: function () {
        return [this._target];
    },

    build: function () {
        var _this = this;
        var destTarget = this._target;
        var destTargetPath = this.node.resolvePath(destTarget);
        var fromNode = this._sourceNodePath;
        var cache = this.node.getNodeCache(destTarget);
        var requirements = {};
        var sourceTargetName = this.node.unmaskNodeTargetName(fromNode, this._sourceTarget);
        var sourceTargetPath = this.node.resolveNodePath(fromNode, sourceTargetName);
        requirements[fromNode] = [sourceTargetName];
        return this.node.requireNodeSources(requirements).then(function () {
            if (cache.needRebuildFile('target-file', destTargetPath) ||
                cache.needRebuildFile('source-file', sourceTargetPath)
            ) {
                return vowFs.read(sourceTargetPath, 'utf8').then(function (data) {
                    vowFs.write(destTargetPath, data).then(function () {
                        cache.cacheFileInfo('target-file', destTargetPath);
                        cache.cacheFileInfo('source-file', sourceTargetPath);
                        _this.node.resolveTarget(destTarget);
                    });
                });
            } else {
                _this.node.isValidTarget(destTarget);
                _this.node.resolveTarget(destTarget);
                return null;
            }
        });
    }
});
