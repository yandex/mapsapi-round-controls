/**
 * ymaps-layout-module
 * ===================
 *
 * Собирает `module.json` для HTML-шаблона.
 *
 * **Опции**
 *
 * * *String* **source** — Исходный `.deps.yaml`-файл.
 * * *String* **target** — Результирующий файл. По умолчанию — `module.json`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech([require('./techs/ymaps-layout-module')]);
 * ```
 */
var yaml = require('js-yaml');

module.exports = require('enb/lib/build-flow').create()
    .name('ymaps-layout-module')
    .target('target', 'module.json')
    .useSourceResult('source', '?.ymaps-deps.js')
    .builder(function (deps) {
        var targetName = this.node.getTargetName(),
            json = {
                name: targetName,
                depends: deps.filter(skipSkins).map(depKey)
            };

        // Содержимое css-макетов (не имеющих собственной разметки) не требуется.
        if (targetName.match(/.html$/)) {
            json.src = [targetName];
        }

        return JSON.stringify(json, null, 4);
    })
    .createTech();
    
function skipSkins(dep) {
    return (dep.modName !== "skin");
}

function depKey(dep) {
    return dep.blockName +
        (dep.elemName ? '__' + dep.elemName : '') +
        (dep.modName ? '_' + dep.modName + (dep.modValue ? '_' + dep.modValue : '') : '');
}
