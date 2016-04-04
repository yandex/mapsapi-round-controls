module.exports = function (bt) {
    /**
     * @param {Btjson} content Содержимое попапа.
     * @param {Boolean} [showArrow=true] Показывать стрелку попапа.
     */

    bt.match('maps-popup', function (ctx) {
        ctx.disableDataAttrGeneration();

        var btjson = [];
        if (ctx.getParam('showArrow') === undefined ||
            ctx.getParam('showArrow')
        ) {
            btjson.push({
                elem: 'arrow'
            });
        }
        btjson.push({
            elem: 'content',
            content: ctx.getParam('content')
        });
        ctx.setContent(btjson);
    });

    bt.match('maps-popup__content', function (ctx) {
        ctx.setContent(ctx.getParam('content'));
    });
};
