module.exports = function (bt) {

    bt.match('maps-zoom', function (ctx) {
        ctx.disableDataAttrGeneration();

        ctx.setContent([
            {
                elem: 'plus',
                icon: {block: 'maps-button-icon', view: 'plus'}
            },
            {
                elem: 'minus',
                icon: {block: 'maps-button-icon', view: 'minus'}
            }
        ]);
    });

    bt.match(['maps-zoom__plus', 'maps-zoom__minus'], function (ctx) {
        ctx.setTag('span');

        ctx.setContent(ctx.getParam('icon'));
    });

};
