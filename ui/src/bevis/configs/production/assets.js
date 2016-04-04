var path = require('path');

module.exports = {
    /**
     * Host for static files.
     */
    host: '/',

    /**
     * Disable middleware for static files.
     */
    middleware: function () {
        return function (req, res, next) {
            return next();
        };
    },

    /**
     * @param {String} assetPath
     * @returns {Module} module
     */
    require: function (assetPath) {
        var modulePath = path.join('..', '..', assetPath);
        return require(modulePath);
    }
};
