module.exports = {
    block: 'maps-listbox',
    content: [
        {
            block: 'maps-button',
            icon: {block: 'maps-button-icon', view: 'layers'}
        },
        {
            block: 'maps-popup',
            // block: 'y-popup',
            // view: 'islet-air',
            // animate: true,
            content: {
                block: 'maps-listbox',
                elem: 'list'
            }
        }
    ]
};
