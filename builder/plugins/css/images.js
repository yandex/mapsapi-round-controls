var path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    fs = require('vow-fs'),
    clc = require('cli-color'),
    PluginError = require('gulp-util').PluginError,
    eachInStream = require('ymb').plugins.util.eachInStream;

module.exports = cssImagesPlugin;

var PLUGIN_NAME = 'ymaps-css-images';

var dataUriByMd5 = {},
    currentCfg = null;

var i = 0;

/**
 * Makes a search for references to images in CSS files, reads images files from `build` path
 * and replaces its references with Data URI representation.
 * @alias "css.images"
 * @param {Object} cfg Config
 * @returns {stream.Transform} Stream
 */
function cssImagesPlugin (cfg) {
    currentCfg = cfg;

    return eachInStream(function (file, encoding, cb) {
        var content = file.contents.toString(),
            re = /[\da-f]{32}\.(svg|gif|png|jpg|jpeg|cur)/gm,
            images = content.match(re);

        if (!images) {
            cb(null, file);
            return;
        }

        processImages(images).then(function () {
            file.contents = new Buffer(content.replace(re, function (fileName) {
                return dataUriByMd5[fileName];
            }));

            cb(null, file);
        }, function (err) {
            console.log(clc.red('[warn] ') + 'Image processing error');
            console.error(err);
            cb(null, file);
        });
    }, PLUGIN_NAME);
}

function processImages (fileNames) {
    var processPromises = [];

    _.each(fileNames, function (fileName) {
        if (!dataUriByMd5[fileName]) {
            processPromises.push(
                fs.read(currentCfg.imagesPath + '/' + fileName).then(function (content) {
                    dataUriByMd5[fileName] = content.toString('utf8').match(/\w*<svg/) ?
                        'data:image/svg+xml;base64,' + content.toString('base64') :
                        'data:image/' + getMimeType(fileName) + ';base64,' + content.toString('base64');
                })
            );
        }
    });

    return vow.all(processPromises);
}

function getMimeType (fileName) {
    var FORMATS = { cur: 'x-icon' };

    var ext = path.extname(fileName).substr(1);

    return FORMATS[ext] || ext;
}