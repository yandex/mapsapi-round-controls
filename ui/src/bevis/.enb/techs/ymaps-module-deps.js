/**
 * ymaps-module-deps
 * =================
 *
 * Фильтрует `deps.yaml`-файл и на его основе собирает `ymaps-deps.yaml`-файл,
 * в который включает лишь те зависимости, где есть css-файлы.
 *
 * **Опции**
 *
 * * *String* **source** — Исходный `deps.yaml`-файл.
 * * *String* **target** — Результирующий файл. По умолчанию — `?.ymaps-deps.yaml`.
 * * *String[]* **suffixes** — Суффиксы для фильтрации.
 *                             По умолчанию — `[css, ie.css, ie8.css, standards.css]`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech([require('./techs/ymaps-module-deps')]);
 * ```
 */

var yaml = require('js-yaml');
var bevis = require('enb-bevis/lib/bevis');

var suffixes = [''];

suffixes = [].concat(
    getFiles(suffixes, 'css'),
    getFiles(suffixes, 'styl')
);

module.exports = require('enb/lib/build-flow').create()
    .name('ymaps-module-deps')
    .target('target', '?.ymaps-deps.js')
    .useFileList(suffixes)
    .builder(function (files) {
        var deps = files.map(function (file) {
            return bevis.parseEntityName(file.name);
        });
        this.setResult(deps);
        return 'module.exports = ' + JSON.stringify(deps, null, 4);
    })
    .createTech();

function getFiles(names, extension) {
    return names.map(function (name) { 
        return name != '' ? 
            name + '.' + extension : 
            extension; 
    });
}
