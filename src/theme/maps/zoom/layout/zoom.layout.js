/**
 * @fileOverfiew Макет зум-контрола.
 */

ym.modules.define({
    name: "theme.round.control.layout.Zoom",
    key: 'round#zoomLayout',
    storage: 'layout',
    depends: [
        "round.zoom.layout.html",
        "templateLayoutFactory",
        "Monitor",
        "domEvent.manager",
        "util.dom.reaction.hover",
        "util.dom.reaction.hold",
        "util.dom.className",
        "util.dom.element",
        "util.dom.style",
        "util.array",
        "shape.Rectangle",
        "geometry.pixel.Rectangle",
        "layout.component.clientBounds",
        "util.css",
        "control.component.setupMarginManager"
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
    declaration: function (provide,
                           layoutHtml,
                           templateLayoutFactory,
                           Monitor,
                           domEventManager,
                           utilHover,
                           utilHold,
                           utilDomClassName,
                           utilDomElement,
                           utilDomStyle,
                           utilArray,
                           ShapeRectangle,
                           PixelRectangleGeometry,
                           clientBounds,
                           utilCss,
                           setupMarginManager) {
        var ZoomLayout = templateLayoutFactory.createClass(layoutHtml, {
            _cssClassPrefix: 'ymaps_',

            build: function () {
                var parentElement = this.getParentElement(),
                    position = this.getData().options.get('position');

                this._offset = position ?
                position.top || position.bottom || 0 :
                    utilDomStyle.getOffset(parentElement)[1];

                ZoomLayout.superclass.build.call(this);
                this._setupZoom();
                setupMarginManager.add(this, function () {
                    return [28, 61];
                }, this);
            },

            getShape: function () {
                var element = this.getElement();
                return element ?
                    new ShapeRectangle(
                        new PixelRectangleGeometry(
                            clientBounds(element)
                        )
                    ) :
                    null;
            },

            _setupZoom: function () {
                var parentElement = this.getParentElement();

                this._plusButton = utilDomElement.findByClassName(parentElement, this._cssClassPrefix + 'maps-zoom__plus');
                this._minusButton = utilDomElement.findByClassName(parentElement, this._cssClassPrefix + 'maps-zoom__minus');

                this._isPlusEnabled = true;
                this._isMinusEnabled = true;

                this._zoomReactions = null;

                this._setupZoomMonitors();
                this._setupZoomEvents();

                this._setupZoomReactions();
                this._applyView();
            },

            clear: function () {
                this._clearZoomMonitors();
                this._clearZoomEvents();
                this._clearZoomReactions();

                setupMarginManager.remove(this);
                ZoomLayout.superclass.clear.call(this);
            },

            _setupZoomMonitors: function () {
                this._stateMonitor = new Monitor(this.getData().state)
                    .add('zoom', this._applyView, this)
                    .add('zoomRange', this._applyView, this);
            },

            _clearZoomMonitors: function () {
                this._stateMonitor.removeAll();
            },

            _setupZoomEvents: function () {
                this._plusButtonListener = domEventManager.group(this._plusButton)
                    .add('click', this._onPlusButtonClick, this);

                this._minusButtonListener = domEventManager.group(this._minusButton)
                    .add('click', this._onMinusButtonClick, this);
            },

            _clearZoomEvents: function () {
                this._plusButtonListener.removeAll();
                this._minusButtonListener.removeAll();
            },

            _onPlusButtonClick: function () {
                if (this._isPlusEnabled) {
                    var zoomStep = this.getData().options.get('zoomStep');
                    this._changeZoom(zoomStep);
                }
            },

            _onMinusButtonClick: function () {
                if (this._isMinusEnabled) {
                    var zoomStep = this.getData().options.get('zoomStep');
                    this._changeZoom(-zoomStep);
                }
            },

            _setupZoomReactions: function () {
                var pressedCss = this._cssClassPrefix + '_pressed';

                this._zoomReactions = {
                    plus: [
                        utilHold.reaction({
                            element: this._plusButton,
                            toggleCssClass: pressedCss
                        })
                    ],
                    minus: [
                        utilHold.reaction({
                            element: this._minusButton,
                            toggleCssClass: pressedCss
                        })
                    ]
                };
            },

            _clearZoomReactions: function () {
                this._disableReactions('plus');
                this._disableReactions('minus');
            },

            /**
             * @ignore
             * Включает реакции на кнопке.
             * @param {String} button "plus" || "minus".
             */
            _enableReactions: function (button) {
                utilArray.each(this._zoomReactions[button], function (reaction) {
                    reaction.enable();
                });
            },

            /**
             * @ignore
             * Выключает реакции на кнопке.
             * @param {String} button "plus" || "minus".
             */
            _disableReactions: function (button) {
                utilArray.each(this._zoomReactions[button], function (reaction) {
                    reaction.disable();
                });
            },

            _getZoomRange: function () {
                return this.getData().state.get('zoomRange') || [0, 23];
            },

            _changeZoom: function (delta) {
                var state = this.getData().state,
                    oldZoom = state.get('zoom'),
                    newZoom = oldZoom + delta,
                    zoomRange = this._getZoomRange();

                newZoom = Math.max(zoomRange[0], Math.min(zoomRange[1], newZoom));

                if (Math.abs(newZoom - oldZoom) > 1e-2) {
                    this.events.fire('zoomchange', {
                        newZoom: newZoom
                    });
                }
            },

            /**
             * @ignore
             * «Выключает» кнопки на максимальном и минимальном зумах.
             */
            _applyView: function () {
                var state = this.getData().state,
                    zoomRange = state.get('zoomRange'),
                    zoom = state.get('zoom'),
                    disabledCss = this._cssClassPrefix + '_disabled';

                // Max zoom.
                this._isPlusEnabled = zoom < zoomRange[1];
                if (!this._isPlusEnabled) {
                    utilDomClassName.add(this._plusButton, disabledCss);
                    this._disableReactions('plus');
                } else {
                    utilDomClassName.remove(this._plusButton, disabledCss);
                    this._enableReactions('plus');
                }

                // Min zoom.
                this._isMinusEnabled = zoom > zoomRange[0];
                if (!this._isMinusEnabled) {
                    utilDomClassName.add(this._minusButton, disabledCss);
                    this._disableReactions('minus');
                } else {
                    utilDomClassName.remove(this._minusButton, disabledCss);
                    this._enableReactions('minus');
                }
            }
        });

        provide(ZoomLayout);
    }
});
