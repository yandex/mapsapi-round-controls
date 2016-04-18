/**
 * @fileOverfiew Макет кнопки линейки и масштабного отрезка.
 */

ym.modules.define({
    name: "theme.round.control.layout.Ruler",
    key: 'round#rulerLayout',
    storage: 'layout',
    depends: [
        "templateLayoutFactory",
        "layout.component.clientBounds",
        "theme.round.control.layout.Button",
        "shape.Rectangle",
        "geometry.pixel.Rectangle",
        "domEvent.manager",
        "control.component.setupMarginManager",
        "util.dom.style",
        "util.dom.element",
        "system.browser"
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
    declaration: function (provide, templateLayoutFactory, clientBounds, ButtonLayout, RectangleShape,
        RectanglePixelGeometry, domEventManager, setupMarginManager, utilDomStyle, utilDomElement, browser) {
        var RulerLayout = templateLayoutFactory.createClass(
            '<ymaps style="display: block;">{% include round#buttonLayout %}</ymaps>', {
                _cssClassPrefix: 'ymaps_',

                build: function () {
                    RulerLayout.superclass.build.call(this);
                    setupMarginManager.add(this, function () {
                        return [125, 28];
                    }, this);

                    var buttonElement = utilDomElement.findByClassName(this.getElement(), this._cssClassPrefix + 'maps-button');

                    utilDomStyle.css(buttonElement, {maxWidth: 38 + 'px'});

                    this._layoutElementListeners = domEventManager.group(buttonElement)
                        .add('click', this._onButtonClick, this);

                    if (browser.isIE && parseInt(browser.version, 10) < 11) {
                        utilDomStyle.css(buttonElement, {top: 3 + 'px'});
                    }
                },

                clear: function () {
                    setupMarginManager.remove(this);
                    this._layoutElementListeners.removeAll();
                    RulerLayout.superclass.clear.call(this);
                },

                getShape: function () {
                    var element = this.getElement();
                    return element && element.firstChild ?
                        new RectangleShape(
                            new RectanglePixelGeometry(
                                clientBounds(element.firstChild)
                            )
                        ) :
                        null;
                },

                _onButtonClick: function () {
                    this.events.fire('rulerbuttonclick');
                }
            });

        provide(RulerLayout);
    }
});
