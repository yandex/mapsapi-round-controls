/**
 * @fileOverfiew Макет кнопки.
 */

ym.modules.define({
name: "theme.round.control.layout.Button",
key: 'round#buttonLayout',
storage: 'layout',
depends: [
    "round.button.layout.html",
    "Monitor",
    "templateLayoutFactory",

    "util.dom.reaction.hold",
    "util.dom.reaction.hover",
    "util.dom.element",
    "util.dom.className",
    "util.dom.style",
    "shape.Rectangle",
    "geometry.pixel.Rectangle",
    "layout.component.clientBounds",
    "util.css",
    "control.component.setupMarginManager",
    "util.pixelBounds",
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

    declaration: function (provide, buttonLayoutHtml, Monitor, templateLayoutFactory,
                           domReactionHold, domReactionHover, domElement, domClassName, domStyle, ShapeRectangle,
                           PixelRectangleGeometry, clientBounds, utilCss, setupMarginManager, utilPixelBounds, browser) {

    var BUTTON_TYPE = {
        ICON_ONLY: 'iconOnly',
        CONTENT_ONLY: 'contentOnly',
        ICON_WITH_CONTENT: 'iconWithContent'
    };

    var ButtonLayout = templateLayoutFactory.createClass(buttonLayoutHtml, {
        _cssClassPrefix: 'ymaps_',

        build: function () {
            ButtonLayout.superclass.build.call(this);

            var parentElement = this.getParentElement(),
                layoutData = this.getData(),
                map = layoutData.control.getMap(),
                mapSize = map.container.getSize();

            this._buttonElement = domElement.findByClassName(parentElement, this._cssClassPrefix + 'maps-button');
            this._buttonTitleElement = domElement.findByClassName(parentElement, this._cssClassPrefix + 'maps-button__text');
            this._buttonIconContainerElement = domElement.findByClassName(parentElement, this._cssClassPrefix + 'maps-button__icon');
            this._buttonIconElement = domElement.findByClassName(parentElement, this._cssClassPrefix + 'maps-button-icon');

            this._buttonAppearance = null;
            this._iconType = null;
            this._checkButtonAppearance();

            this._applyEnabled();
            this._applySelected();

            this._stateMonitor = new Monitor(layoutData.state)
                .add('enabled', this._applyEnabled, this)
                .add('selected', this._applySelected, this)
                .add('size', this._checkButtonAppearance, this)
                .add('maxWidth', this._applyWidth, this);

            this._dataMonitor = new Monitor(layoutData.data)
                .add(['image', 'content', 'iconType'], this._checkButtonAppearance, this);

            if (mapSize[0] == 0 && mapSize[1] == 0) {
                map.events.once('sizechange', this._onMapSizeChange, this);
            } else {
                this._applyWidth();
            }

            setupMarginManager.add(this, function () {
                var shape = this.getShape(),
                    shapeSize = utilPixelBounds.getSize(shape.getBounds());
                return [shapeSize[0], 28];
            }, this);
        },

        getShape: function () {
            return this.getElement() ?
                new ShapeRectangle(new PixelRectangleGeometry(
                    clientBounds(this.getElement())
                )) :
                null;
        },

        clear: function () {
            if (this.getData().state.get('enabled')) {
                this._clearHoldReaction();
            }
            this._hoverReaction.disable();

            this._stateMonitor.destroy();
            this._dataMonitor.destroy();

            setupMarginManager.remove(this);

            ButtonLayout.superclass.clear.call(this);
        },

        _applyEnabled: function () {
            if (this.getData().state.get('enabled')) {
                this._setupHoldReaction();
                domClassName.remove(this._buttonElement, this._cssClassPrefix + '_disabled');
            } else {
                this._clearHoldReaction();
                domClassName.add(this._buttonElement, this._cssClassPrefix + '_disabled');
            }
        },

        _applySelected: function (keys, values) {
            if (this.getData().state.get('selected')) {
                domClassName
                    .add(this._buttonElement, this._cssClassPrefix + '_pressed')
                    .add(this._buttonElement, this._cssClassPrefix + '_checked');
            } else {
                domClassName
                    .remove(this._buttonElement, this._cssClassPrefix + '_checked')
                    .remove(this._buttonElement, this._cssClassPrefix + '_pressed');
            }
        },

        _setupHoldReaction: function () {
            this._holdReaction = domReactionHold.reaction({
                element: this.getParentElement(),
                targetElement: this._buttonElement,
                toggleCssClass: this._cssClassPrefix + '_pressed'
            });
        },

        _clearHoldReaction: function () {
            if (this._holdReaction) {
                this._holdReaction.disable();
            }
        },

        _checkButtonAppearance: function () {
            var newAppearance = this._resolveAppearance();
            if (newAppearance != this._buttonAppearance) {
                if (this._buttonAppearance) {
                    this._clearAppearance(this._buttonAppearance);
                }
                this._applyAppearance(newAppearance);
            } else if (newAppearance == 'iconOnly') {
                this._applyIcon();
            }
            this._buttonAppearance = newAppearance;
        },

        _applyAppearance: function (appearance) {
            switch (appearance) {

                case BUTTON_TYPE.ICON_ONLY:
                    domClassName.add(this._buttonElement, this._cssClassPrefix + '_icon_only');
                    domStyle.css(this._buttonTitleElement, {
                        display: 'none'
                    });
                    this._applyIcon();
                    break;

                case BUTTON_TYPE.CONTENT_ONLY:
                    domClassName.add(this._buttonElement, this._cssClassPrefix + '_text_only');
                    domStyle.css(this._buttonIconContainerElement, {
                        display: 'none'
                    });
                    break;

                case BUTTON_TYPE.ICON_WITH_CONTENT:
                    this._applyIcon();
                    break;
            }
        },

        _clearAppearance: function (appearance) {
            switch (appearance) {
                case BUTTON_TYPE.ICON_ONLY:
                    domClassName.remove(this._buttonElement, this._cssClassPrefix + '_icon_only');
                    domStyle.css(this._buttonTitleElement, {
                        display: 'block'
                    });
                    break;

                case BUTTON_TYPE.CONTENT_ONLY:
                    domClassName.remove(this._buttonElement, this._cssClassPrefix + '_text_only');
                    domStyle.css(this._buttonIconElement, {
                        display: 'block'
                    });
                    break;
            }
        },

        _resolveAppearance: function () {
            var state = this.getData().state,
                data = this.getData().data,
                hasImage = data.get('image') || data.get('iconType'),
                hasContent = data.get('content'),
                size = state.get('size');

            if (!hasImage && !hasContent) {
                return BUTTON_TYPE.CONTENT_ONLY;
            }
            if ((size == 'small' && hasImage) || (!hasContent)) {
                return BUTTON_TYPE.ICON_ONLY;
            }
            if ((size == 'medium' && hasContent) || (!hasImage)) {
                return BUTTON_TYPE.CONTENT_ONLY;
            }
            return BUTTON_TYPE.ICON_WITH_CONTENT;
        },

        _applyIcon: function () {
            var data = this.getData().data;
            if (data.get('image')) {
                if (this._iconType) {
                    domClassName.remove(this._buttonIconElement, this._cssClassPrefix + 'maps-button-icon_' + this._iconType);
                    this._iconType = null;
                }
                domStyle.css(this._buttonIconElement, {
                    'backgroundImage': 'url("' + data.get('image') + '")'
                });
            } else {
                var newIconType = data.get('iconType');
                if (this._iconType != newIconType) {
                    if (this._iconType) {
                        domClassName.remove(this._buttonIconElement, this._cssClassPrefix + 'maps-button-icon_' + this._iconType);
                    }
                    domClassName.add(this._buttonIconElement, this._cssClassPrefix + 'maps-button-icon_' + newIconType);
                    this._iconType = newIconType;
                }
            }
        },

        _applyWidth: function () {
            if (browser.oldIE) {
                var layoutData = this.getData(),
                    element = this._buttonElement,
                    currentWidth = domStyle.getSize(element, {
                            includePadding: true,
                            includeBorder: true
                        })[0] + 4,
                    stateWidth = layoutData.state.get('maxWidth');

                if (currentWidth < stateWidth) {
                    domStyle.css(element, {width: currentWidth});
                } else {
                    domStyle.css(element, {width: stateWidth});
                }
            }
        },

        _onMapSizeChange: function () {
            this._applyWidth();
        }
    });

    provide(ButtonLayout);
    }
});
