module.exports = {
    block: 'maps-listbox',
    returnContent: true,
    content: {
        elem: 'list-item',
        text: '{{ data.content|raw }}',
        //image: '{{ data.mapType|raw }}',
        mapType: '{{ data.mapType|raw }}'
        //text: 'TEXT'
    }
};

/*
[
    {
        block: 'listbox',
        elem: 'list-item',
        mods: {selected: 'no'},
        content: '{{ data.content|raw }}'
    }
]
*/