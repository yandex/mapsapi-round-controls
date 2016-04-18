/**
 * @fileOverview Макет пункта выпадающего списка.
 */


ym.modules.define({
    name: "theme.round.control.layout.ListBoxSelectableItem",
    key: 'round#listBoxItemSelectableLayout',
    storage: 'layout',
    depends: [
        "templateLayoutFactory",
        "round.listbox.layout.item.html",
        "util.dom.element",
        "util.dom.className",
        "util.dom.style",
        "Monitor"
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
    declaration: function (provide, templateLayoutFactory, itemHtml,
                           domElement, domClassName, domStyle, Monitor) {
        var CSS_CLASS_PREFIX = 'ymaps_';

        var ListBoxSelectableItem = templateLayoutFactory.createClass(itemHtml, {
            build: function () {
                ListBoxSelectableItem.superclass.build.call(this);
                domStyle.patch(this.getElement(), { selectable: false });
                this._itemElement = domElement.findByClassName(this.getParentElement(), CSS_CLASS_PREFIX + 'maps-listbox__list-item');
                this._applySelected(this.getData().state.get('selected'));
                this._applyEnabled(this.getData().state.get('enabled', true));
                this._stateMonitor = new Monitor(this.getData().state)
                    .add('selected', this._applySelected, this)
                    .add('enabled', this._applyEnabled, this);
            },

            clear: function () {
                this._stateMonitor.removeAll();
                ListBoxSelectableItem.superclass.clear.call(this);
            },

            _applySelected: function (selected) {
                if (selected) {
                    domClassName.add(this._itemElement, CSS_CLASS_PREFIX + '_selected');
                } else {
                    domClassName.remove(this._itemElement, CSS_CLASS_PREFIX + '_selected');
                }
            },

            _applyEnabled: function (enabled) {
                if (enabled) {
                    domClassName.remove(this._itemElement, CSS_CLASS_PREFIX + '_disabled');
                } else {
                    domClassName.add(this._itemElement, CSS_CLASS_PREFIX + '_disabled');
                }
            }
        });

        provide(ListBoxSelectableItem);
    }
});
