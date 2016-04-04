module.exports = function (bt) {
    /**
     * @param {String} image путь к пользовательской иконке, который выливается в атрибут style
     * @param {String} state состояние
     */

    bt.match('maps-button-icon*', function (ctx) {
        ctx.disableDataAttrGeneration();

        ctx.setTag('span');

        var image = ctx.getParam('image');
        if (image) {
            ctx.setAttr('style', 'background-image: url(' +  image + ')');
        }
    });
};
