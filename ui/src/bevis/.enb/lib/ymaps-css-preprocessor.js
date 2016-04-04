/**
 * CssPreprocessor
 * ===============
 */
var inherit = require('inherit');
var path = require('path');
var Vow = require('vow');
var vowFs = require('enb/lib/fs/async-fs');

/**
 * CssPreprocessor — класс для препроцессинга CSS.
 * Заменяет import'ы на содержимое CSS-файлов, изменяет url'ы картинок.
 * Сохраняет картинки.
 * @name CssPreprocessor
 */
module.exports = inherit({

    /**
     * Конструктор.
     * @param {String} imgPath Путь для сохранения картинок.
     */
    __constructor: function () {
        var builder = function (url) {
            return url;
        };

        this._imgPathBuilder = builder;
        this._cssPathBuilder = builder;
    },

    /**
     * Устанавливает функцию для построения относительных путей.
     * @var {Function} builder
     */
    setCssPathBuilder: function (builder) {
        this._cssPathBuilder = builder;
    },

    setImgPathBuilder: function (builder) {
        this._imgPathBuilder = builder;
    },

    setPathBuilder: function (builder) {
        this._cssPathBuilder = this._imgPathBuilder = builder;
    },

    /**
     * Запускает препроцессинг.
     * @param {String} data CSS для препроцессинга.
     * @param {String} filename Имя результирующего файла.
     * @returns {Promise}
     */
    preprocess: function (data, filename) {
        return this._preprocessCss(data, filename)
            .spread(this._preprocessImgs, this)
    },

    _preprocessCss: function (data, filename) {
        var regExp = /@import\s*(?:url\()?["']?([^"'\)]+)["']?(?:\))?\s*;/g;
        var loadPromises = [];
        var filesToLoad = [];
        var _this = this;

        function addLoadPromise (url) {
            var includedFilename = path.resolve(path.dirname(filename), url);
            loadPromises.push(vowFs.read(includedFilename, 'utf8').then(function (data) {
                return _this._preprocessCss(data, includedFilename).then(function (preprocessedData) {
                    filesToLoad[url] = preprocessedData;
                });
            }));
        }

        while (!!(match = regExp.exec(data))) {
            var file = this._cssPathBuilder(match[1]);
            addLoadPromise(file);
        }

        return Vow.all(loadPromises).then(function () {
            data = data.replace(/@import\s*(?:url\()?["']?([^"'\)]+)["']?(?:\))?\s*;/g, function (s, url) {
                var pre = '/* ' + url + ': begin */ /**/\n';
                var post = '\n/* ' + url + ': end */ /**/\n';
                return pre + '    ' + filesToLoad[url].toString().replace(/\n/g, '\n    ') + post;
            });

            return [data, filename];
        });
    },

    _preprocessImgs: function (data, filename) {
        var _this = this;

        data = data
            .replace(/url\(('[^']+'|"[^"]+"|[^'")]+)\)/g, function (s, url) {
                if (s.indexOf('@import') === 0) {
                    return s;
                }
                // Тип кавычки
                var q = '';
                var firstChar = url.charAt(0);
                if (firstChar === '\'' || firstChar === '"') {
                    url = url.substr(1, url.length - 2);
                    q = firstChar;
                }

                return 'url(' + q + _this._resolveImgsUrl(url, filename) + q + ')';
            })
            .replace(/src=[']?([^',\)]+)[']?/g, function (s, url) {
                return 'src=\'' + _this._resolveImgsUrl(url, filename) + '\'';
            });

        return data;
    },

    _resolveImgsUrl: function (url, filename) {
        if (url.substr(0, 5) === 'data:' ||
            url.substr(0, 2) === '//' ||
            url.substr(0, 1) === '#' ||
            ~url.indexOf('http://') ||
            ~url.indexOf('https://')
        ) {
            return url;
        } else {
            return this._imgPathBuilder(url, filename);
        }
    }
});
