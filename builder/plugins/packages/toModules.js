var path = require('path'),
    PluginError = require('gulp-util').PluginError,
    eachInStream = require('ymb').plugins.util.eachInStream;

module.exports = toModulesPlugin;

var PLUGIN_NAME = 'ymaps-packages-to-modules';

/**
 * Converts `package.json` files to `ym` modules.
 * @alias "packages.toModules"
 * @returns {stream.Transform} Stream
 */
function toModulesPlugin () {
    return eachInStream(function (file, encoding, cb) {
        var json = parseJson(file, cb);

        if (!json) {
            return;
        }

        var moduleName = json.name,
            deps = parseDeps(json.depends);

        file.contents =
            new Buffer('ym.modules.define(\'' + moduleName + '\', ' + deps + ', function (provide) {\nprovide({});\n});');

        file.path = path.join(file.base, moduleName + '.js');

        cb(null, file);
    }, PLUGIN_NAME);
}

function parseJson (file, cb) {
    try {
        return JSON.parse(file.contents.toString());
    } catch (e) {
        console.error('JSON parsing failed');

        cb(new PluginError(PLUGIN_NAME, 'JSON parsing failed', {
            fileName: file.path,
            showStack: false
        }));

        return null;
    }
}

function parseDeps (deps) {
    if (typeof deps == 'string') {

        deps = deps.replace(
            new RegExp("project.support.browser.name == 'MSIE' && project.support.browser.documentMode == 8", 'g'),
             'ym.env.browser.oldIE'
        );

        return 'function (ym) { ' + deps + '; }';
    }

    return JSON.stringify(deps || []);
}