module.exports = function (bt) {

    bt.match('maps-listbox', function (ctx) {
        ctx.disableDataAttrGeneration();

        if (ctx.getParam('returnContent')) {
            return ctx.getParam('content');
        } else {
            ctx.setContent(ctx.getParam('content'));
        }
    });

    bt.match(['maps-listbox__panel', 'maps-listbox__list'], function (ctx) {
        ctx.setContent(ctx.getParam('content'));
    });

    bt.match('maps-listbox__list-item', function (ctx) {
        var image = ctx.getParam('image');
        var mapType = ctx.getParam('mapType');

        //if (image)
        ctx.setState('image', image);
        ctx.setAttr('data-type', mapType);

        ctx.setContent([
            (mapType) ? {elem: 'list-item-image'} : '',
            ctx.getParam('text')
        ]);
    });
};