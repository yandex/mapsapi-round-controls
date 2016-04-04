var path = require('path');
var vow = require('vow');
var extend = require('node.extend');
var assets = require('./config').get('assets');

var DEFAULT_LANG = 'ru';

/**
 * Builds pages from sources. Responds with HTML.
 *
 * @param {String} pagePath
 * @param {http.ClientRequest} req
 * @param {http.ServerResponse} res
 * @param {Function} next
 * @param {Object} [data] Data to be passed to the `priv` file.
 */
module.exports = function (pagePath, req, res, next, data) {
    var lang = DEFAULT_LANG;
    vow.all([
        assets.require(buildAssetPath(pagePath, 'priv')),
        assets.require(buildAssetPath(pagePath, 'bt')),
        assets.require(buildAssetPath(pagePath, 'lang.' + lang))
    ]).spread(function (priv, bt, buildI18n) {
        var i18n = buildI18n();
        priv.setI18n(i18n);
        bt.lib.i18n = i18n;

        var pageName = path.basename(pagePath);
        extend(true, data || {}, {
            assetsPath: assets.host + pagePath + '/_' + pageName,
            lang: lang
        });
        res.end(bt.apply(priv.exec(pageName + '-page', data)));
    }).fail(function (error) {
        next(error);
    });
};

/**
 * Generates build path for the specified page.
 *
 * @param {String} pagePath
 * @param {String} assetName
 * @returns {String}
 */
function buildAssetPath(pagePath, assetName) {
    return '/' + pagePath + '/' + path.basename(pagePath) + '.' + assetName + '.js';
}
