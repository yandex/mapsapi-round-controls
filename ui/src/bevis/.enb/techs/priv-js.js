var path = require('path'),
    vowFs = require('vow-fs');

module.exports = require('enb/lib/build-flow').create()
    .name('priv-js')
    .target('target', '?.priv.js')
    .defineOption('privFile', '')
    .useFileList(['priv.js'])
    .needRebuild(function(cache) {
        this._privFile = this._privFile || '.enb/lib/priv.js';
        this._privFile = this.node._root + '/' + this._privFile;
        return cache.needRebuildFile('priv-file', this._privFile);
    })
    .saveCache(function(cache) {
        cache.cacheFileInfo('priv-file', this._privFile);
    })
    .builder(function(bhFiles) {
        var node = this.node;
        function buildRequire(absPath, pre, post) {
            var relPath = node.relativePath(absPath);
            return [
                'delete require.cache[require.resolve("' + relPath + '")];',
                (pre || '') + 'require("' + relPath + '")' + (post || '') + ';'
            ].join('\n');
        }
        return [
            buildRequire(this._privFile, 'var Blocks = '),
            'var blocks = new Blocks();',
            bhFiles.map(function(file) {
                return buildRequire(file.fullname, '', '(blocks)');
            }).join('\n'),
            'module.exports = blocks;'
        ].join('\n');
    })
    .createTech();

