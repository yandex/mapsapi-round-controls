var express = require('express');
var enbServerMiddleware = require('enb/lib/server/server-middleware');
var dropRequireCache = require('enb/lib/fs/drop-require-cache');
var enbBuilder = enbServerMiddleware.createBuilder();

module.exports = {
    /**
     * Host for static files.
     */
    host: '/',

    /**
     * @returns {Object} Express application as middleware.
     */
    middleware: function () {
        return express.Router()
            .use(enbServerMiddleware.createMiddleware())
            .use('/blocks', express.static(__dirname + '/../../blocks'))
            .use('/node_modules', express.static(__dirname + '/../../node_modules'))
            .use('/test/client', express.static(__dirname + '/../../test/client'));
    },

    /**
     * @param {String} assetPath
     * @returns {Module} module
     */
    require: function (assetPath) {
        return enbBuilder(assetPath).then(function (fileName) {
            dropRequireCache(require, fileName);
            return require(fileName);
        });
    }
};
