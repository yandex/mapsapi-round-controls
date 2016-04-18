/**
 * @fileOverfiew Макет кнопки.
 */

ym.modules.define({
    name: "theme.round.control.layout.ListBoxItem",
    key: 'round#listBoxItemLayout',
    storage: 'layout',
    depends: [
        "templateLayoutFactory",
        "theme.round.control.layout.ListBoxSelectableItem"
    ],
    dynamicDepends: {
        contentLayout: function (data) {
            var key = data.options.get('contentLayout');
            return (typeof key == 'string') ? {
                key: key,
                storage: 'layout'
            } : key;
        }
    },
    declaration: function (provide, templateLayoutFactory, ListBoxSelectableItem) {
        var ListBoxItemLayout = templateLayoutFactory.createClass(
            '{% include "round#listBoxItemSelectableLayout" %}'
        );
        provide(ListBoxItemLayout);
    }
});
