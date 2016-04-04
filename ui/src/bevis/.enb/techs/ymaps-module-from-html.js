/**
 * ymaps-layout-module
 * ===================
 *
 * Собирает `html.js`-файл из `html`-шаблона.
 *
 * **Опции**
 *
 * * *String* **source** — Исходный файл.
 * * *String* **target** — Результирующий файл. По умолчанию — `?.js`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech([require('./techs/ymaps-module-from-html')]);
 * ```
 */

module.exports = require('enb/lib/build-flow').create()
    .name('ymaps-module-from-html')
    .target('target', '?')
    .useSourceText('source', '?.tmp')
    .builder(function (htmlSource) {
        var cssPrefix = 'ymaps_';

        return htmlSource
        // экранируем переносы строки
            .replace(/\n|\r/g, '')
            // кастомный тег <ymaps>
            .replace(/<(\/?)(span|div|label|form|button)/g, '<$1ymaps')
            // удаляем класс i-bem
            .replace(" i-bem", '')
            // удаляем ненужный нам эскейпинг
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#x2F;/g, '\/')
            .replace(/&quot;/g, '\"')
            .replace(/&amp;/g, '&')
            // все префиксы заменяем на "ymaps-"
            .replace(
                /class="([^"]+)"/g,
                function (_, className) {
                    return 'class="' + className.replace(/([\S]+)/g, cssPrefix + '$1') + '"';
                }
            )
            // удаляем некоторые атрибуты
            .replace(/(id|onclick|action|for)="[^"]*"/g, '');
    })
    .createTech();
