/**
 * ymaps--fragments
 * ===================
 */
var vowFs = require('enb/lib/fs/async-fs');
var vow = require('vow');
var path = require('path');
var bevis = require('enb-bevis/lib/bevis');
var inherit = require('inherit');
var CssPreprocessor = require('../lib/ymaps-css-preprocessor');
var imgPreprocessor = require('../lib/ymaps-image-preprocessor');

var IMAGES_SAVE_DIR = '../../build/images/';

module.exports = inherit(require('enb/lib/tech/base-tech'), {
    getName: function () {
        return 'ymaps--fragments'; 
    },

    configure: function () {
        var node = this.node;

        // Имя deps-файла.
        this._sourceTarget = this.getRequiredOption('sourceTarget');
        this._sourcesFile = this.node.unmaskTargetName('?.sources');
        
        this._filesTarget = node.unmaskTargetName('?.files');
        this._cssTarget = node.unmaskTargetName('?.css');
        this._target = node.unmaskTargetName('?.fragments');
    },

    getTargets: function () {
        return [this._target];
    },

    build: function () {
        var filesTarget = this._filesTarget,
            sourceTarget = this._sourceTarget;

        return this.node.requireSources([this._sourceTarget, this._sourcesFile]).spread(function (dependencies, sources) {
            dependencies.forEach(function (dep) {
                dep.files = sources.getFilesByDecl(dep.blockName, dep.elemName, dep.modName, dep.modValue).filter(function (fileInfo) {
                    var suffix = fileInfo.suffix;
                    if (suffix.indexOf('styl') != -1 || suffix.indexOf('css') != -1) {
                        return fileInfo;
                    }
                });
            });

            // Собираем CSS модуль из STYL файлов.
            vow.all([
                this._makeCssModules(dependencies, sources, this._cssTarget)
            ]);

        }.bind(this));
    },

    _makeCssModules: function (dependencies, sources, target) {
        var techName = this.getName();
        var node = this.node;

        return node.requireSources([target]).then(function () {
            return vowFs.read(node.resolvePath(target)).then(function (cssContent) {
                cssContent = cssContent.toString('utf8');

                // Собираем для каждого блока свой CSS код, оставляем только те, у которых есть.
                var promises = [];
                dependencies.forEach(function (dep) {
                    var moduleName = depKey(dep),
                        directoryPath = node.resolvePath(moduleName),
                        moduleJsonPath = directoryPath + '/module.json',
                        cssPath = directoryPath + '/' + moduleName + '.css';

                    var moduleJsonSource = JSON.stringify({
                        "name": moduleName,
                        "src": [moduleName + ".css"]
                    }, null, 4);

                    var cssPreprocessor = new CssPreprocessor();
                    cssPreprocessor.setImgPathBuilder(function (imgPath, filename) {
                        var dirname = path.dirname(filename);
                        var urlFilename = path.resolve(dirname, '..', imgPath);

                        
                        return imgPreprocessor.process(urlFilename, IMAGES_SAVE_DIR);
                    });

                    promises.push(cssPreprocessor.preprocess(getCssByDep(cssContent, dep), cssPath).then(function (cssResult) {
                        cssResult = addYmapsPrefixes(cssResult, getCssPrefix());

                        return vowFs.makeDir(directoryPath).then(function () {
                            return vow.all([
                                vowFs.write(cssPath, cssResult),
                                vowFs.write(moduleJsonPath, moduleJsonSource)
                            ]).then(function () {
                                node.getLogger().logAction('rebuild', moduleName, techName);
                                return true;
                            });
                        });
                    }));
                }, this);

                return vow.all(promises);
            }, this);
        }, this); 
    }
});

// Удаляем первую и последнюю строчки. 
function prepareCss (cssString) {
    var cssArray = cssString.split('\n');
    cssArray.shift();
    cssArray.pop();

    return cssArray.length ? cssArray.join('\n') : '';
}   

function depKey(dep) {
   return dep.blockName +
       (dep.elemName ? '__' + dep.elemName : '') +
       (dep.modName ? '_' + dep.modName + (dep.modValue ? '_' + dep.modValue : '') : '');
}

// Регулярное выражение для поиска групп классов css.
var cssClassesReg = /([\s^}]*)([^{]+)\{([^{}]+)\}/g;
// Регулярка для поиска отдельных названий классов в группе.
var classNameReg = /([\s]+|^|([A-Za-z.\(\)]+[A-Za-z0-9.\(\)]?))\.(\w-?)/g;
// Регулярка для поиска многострочных комментариев.
var multilineCommentsReg = /(\/\*)(.|\s)*?(\*\/)/mg;
// Регулярка для поиска однострочных комментариев.
var lineCommentReg = /\/\/.*$/mg;

function addYmapsPrefixes(css, cssPrefix) {
    var cssWithoutComments = css
            // Удаляем все комменты типа /* */
            .replace(multilineCommentsReg, '')
            // Удаляем все однострочные комменты
            .replace(lineCommentReg, '');
    var cssClassesArray;
    // По очереди находим все объявления классов
    while ((cssClassesArray = cssClassesReg.exec(cssWithoutComments)) != null) {
        var cssClasses = cssClassesArray[2];
            // Подстановка префиксов ymaps-
        var fixedClasses = cssClasses.replace(classNameReg, '$1.' + cssPrefix + '$3');
        css = css.replace(cssClasses, fixedClasses);
    }
    return css;
}

function getCssPrefix() {
    return 'ymaps_';
}

function getCssByDep (cssContent, dep) {
    var depCssContent = null;
    dep.files.forEach(function (fileInfo) {
        if (!fileInfo || !fileInfo.name) { return; }

        var start = cssContent.indexOf(fileInfo.name),
            end = 0;

        if (start != -1) {
            end = cssContent.indexOf(fileInfo.name, start + 1);
            depCssContent = prepareCss(cssContent.slice(start, end));
        }
    });

    return depCssContent;
}
