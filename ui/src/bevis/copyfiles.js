#!/usr/bin/env node

var exec = require('child_process').exec;
var vowFs = require('vow-fs');
var fs = require('fs');
var path = require('path');

var TARGET_PATH = fs.realpathSync('build/api/layouts/');

vowFs.glob('../../../src/markup/bevis/**/*.btjson.js').done(function (files) {
    files.forEach(function (file) {
        var dir = path.dirname(file),
            dirPath = fs.realpathSync(dir);

        exec('cp -R ' + dirPath + ' ' + TARGET_PATH);
    });
});
