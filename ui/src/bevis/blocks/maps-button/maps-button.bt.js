module.exports = function (bt) {

    /**
     * @param {Btjson} icon блок или элемент любого блока, формирующий иконку.
     * @param {String | Boolean} text текст кнопки, в значении true создаётся элемент без контента.
     * @param {Boolean} disabled устанавливает состояние disabled, кнопка задизейблена.
     * @param {Boolean} checked устанавливает состояние checked, кнопка зажата.
     * @param {String} style задаёт инлайновый стиль, нужно для уставновки max-width.
     * @param {String} title задаёт html-атрибут title.
     */

    bt.match('maps-button*', function (ctx) {
        ctx.disableDataAttrGeneration();

        ctx.setTag('button');

        var icon = ctx.getParam('icon');
        var text = ctx.getParam('text');

        ctx.setContent([
            icon ? {elem: 'icon', name: icon} : null,
            text ? {elem: 'text', content: text} : null
        ]);

        var disabled = ctx.getParam('disabled');
        if (disabled) {
            ctx.setState('disabled');
        }

        var checked = ctx.getParam('checked');
        if (checked) {
            ctx.setState('checked');
        }

        var style = ctx.getParam('style');
        if (style) {
            ctx.setAttr('style', style);
        }

        var title = ctx.getParam('title');
        if (title) {
            ctx.setAttr('title', title);
        }

    });

    bt.match('maps-button*__content', function (ctx) {
        var icon = ctx.getParam('icon');
        var text = ctx.getParam('text');

        ctx.setContent([
            icon ? {elem: 'icon', name: icon} : null,
            text ? {
                elem: 'text',
                content: (text === true) ? null : text
            } : null
        ]);
    });

    bt.match('maps-button*__icon', function (ctx) {
        ctx.setTag('span');

        ctx.setContent(ctx.getParam('name'));
    });

    bt.match('maps-button*__text', function (ctx) {
        ctx.setTag('span');

        ctx.setContent(ctx.getParam('content'));
    });
};
