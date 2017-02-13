/**
 * @fileOverfiew Макет выпадающего списка.
 */

// Дополнительный зазор для выставления max-height выпадушке
// из-за особенностей верстки + отступ для копирайтов.
var PANEL_PADDING = 40;

ym.modules.define({
    name: "theme.round.control.layout.ListBox",
    key: 'round#listBoxLayout',
    storage: 'layout',
    depends: [
        "templateLayoutFactory",
        "round.listbox.layout.html",
        "util.dom.element",
        "util.dom.reaction.hover",
        "util.dom.reaction.hold",
        "util.dom.className",
        "util.dom.style",
        "util.math.areEqual",
        "Monitor",
        "shape.Rectangle",
        "geometry.pixel.Rectangle",
        "layout.component.clientBounds",
        "control.component.setupMarginManager",
        "system.browser",
        "util.css",
        "util.array"
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
    declaration: function (provide, templateLayoutFactory, listBoxHtml, domElement, reactionHover,
                           reactionHold, domClassName, domStyle, areEqual, Monitor, ShapeRectangle, PixelRectangleGeometry,
                           clientBounds, setupMarginManager, browser, utilCss, utilArray) {
        var sizes = ['small', 'medium', 'large'];

        var CSS_CLASS_PREFIX = 'ymaps_';

        var OPENED_YES_CLASS = CSS_CLASS_PREFIX + '_opened',
            OPENED_NO_CLASS =  CSS_CLASS_PREFIX + '_closed',

            POPUP_SHOWN_CLASS = CSS_CLASS_PREFIX + '_shown',
            POPUP_POSITION_RIGHT_CLASS =  CSS_CLASS_PREFIX + '_position_right',
            POPUP_POSITION_LEFT_CLASS =  CSS_CLASS_PREFIX + '_position_left',

            ANIMATION_SHOW_CLASS =  CSS_CLASS_PREFIX + '_animation_show',
            ANIMATION_HIDE_CLASS =  CSS_CLASS_PREFIX + '_animation_hide',
            ANIMATION_CLASS =  CSS_CLASS_PREFIX + '_animate',

            BUTTON_ICON_ONLY_CLASS =  CSS_CLASS_PREFIX + '_icon_only',

            SCROLLABLE_CLASS =  CSS_CLASS_PREFIX + '_scrollable';

        var ListBoxLayout = templateLayoutFactory.createClass(listBoxHtml, {
            build: function () {
                ListBoxLayout.superclass.build.call(this);

                var layoutData = this.getData(),
                    control = layoutData.control,
                    parentElement = this.getParentElement();

                this._childContainerElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-listbox__list');
                this._fireChildContainerChange(null, this._childContainerElement);

                this._buttonElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-button');
                this._listBoxElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-listbox');
                this._listBoxPanelElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-popup');
                this._buttonIconElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-button__icon');
                this._buttonTitleElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-button__title');
                this._selectListElement = domElement.findByClassName(parentElement,  CSS_CLASS_PREFIX + 'maps-listbox__list');

                domStyle.patch(this._listBoxPanelElement, {
                    transform: {
                        use3D: true
                    }
                });

                this._buttonAppearance = null;
                this._iconType = null;
                this._checkButtonAppearance();

                this._applyEnabled();
                this._alignRight = false;
                this._expanded = false;
                this._applyExpanded();

                this._stateMonitor = new Monitor(layoutData.state)
                    .add('enabled', this._applyEnabled, this)
                    .add('expanded', this._applyExpanded, this)
                    .add(['size', 'image', 'content', 'iconType'], this._checkButtonAppearance, this);

                this._optionsMonitor = new Monitor(layoutData.options)
                    .add('popupFloat', this._applySide, this);

                // Если добавили широкого ребенка, контрол может перестать помещаться
                // и нужно передвинуть попап.
                this._childAddListener = control.events
                    .group()
                    .add('layoutmapchange', this._onChildLayoutChange, this);

                // Если добавили другой контрол, этот может поменять положение
                // и положение попапа будет неактуально.
                this._parentAddListener = control.getParent().events
                    .group()
                    .add(['shapechange'], this._onShapeChange, this);

                control.getMap().container.events.once('sizechange', function (e) {
                    if (areEqual(e.get('oldSize'), [0, 0])) {
                        this._setupControlWidth();
                    }
                }, this);

                setupMarginManager.add(this, function () {
                    var layoutData = this.getData(),
                        maxWidthValue = layoutData.options.get('maxWidth'),
                        size = layoutData.state.get('size'),
                        index = utilArray.indexOf(sizes, size);

                    return [maxWidthValue[index], 28];
                }, this);

                domClassName.add(this._listBoxPanelElement, ANIMATION_CLASS);
            },

            clear: function () {
                this._parentAddListener.removeAll();
                this._childAddListener.removeAll();

                if (this._expandMapEventsListeners) {
                    this._expandMapEventsListeners.removeAll();
                }

                this._clearAnimationRemoveTimeout();
                if (this.getData().state.get('enabled', true)) {
                    this._clearHoldReaction();
                }
                this._hoverReaction.disable();
                this._stateMonitor.destroy();
                this._optionsMonitor.destroy();

                var oldChildContainer = this._childContainerElement;
                this._childContainerElement = null;
                this._fireChildContainerChange(oldChildContainer, null);

                setupMarginManager.remove(this);

                ListBoxLayout.superclass.clear.call(this);
            },

            getShape: function () {
                return this.getElement() ?
                    new ShapeRectangle(new PixelRectangleGeometry(
                        clientBounds(this.getElement())
                    )) :
                    null;
            },

            getChildContainerElement: function () {
                return this._childContainerElement;
            },

            _fireChildContainerChange: function (oldChildContainerElement, newChildContainerElement) {
                this.events.fire('childcontainerchange', {
                    newChildContainerElement: newChildContainerElement,
                    oldChildContainerElement: oldChildContainerElement
                });
            },

            _applyEnabled: function () {
                if (this.getData().state.get('enabled', true)) {
                    this._setupHoldReaction();
                    domClassName.remove(this._buttonElement,  CSS_CLASS_PREFIX + '_disabled');
                } else {
                    this._clearHoldReaction();
                    domClassName.add(this._buttonElement,  CSS_CLASS_PREFIX + '_disabled');
                }
            },

            _applyExpanded: function () {
                var newExpanded = this.getData().state.get('expanded', false),
                    listBoxElement = this._listBoxElement,
                    listBoxPanelElement = this._listBoxPanelElement;

                if (newExpanded != this._expanded) {

                    if (!this._expandMapEventsListeners) {
                        this._expandMapEventsListeners = this.getData().control.getMap().events.group();
                    } else {
                        this._expandMapEventsListeners.removeAll();
                    }

                    this._expanded = newExpanded;

                    if (newExpanded) {
                        this._applySide();
                        this._applyMaxHeight();
                        this._expandMapEventsListeners.add('sizechange', this._onMapSizeChange, this);
                        if (domClassName.has(listBoxElement, OPENED_NO_CLASS)) {
                            // Мы не добавляем классы, отвечающие за анимацию, при первом открытии.
                            domClassName.remove(listBoxElement, OPENED_NO_CLASS);
                            domClassName.remove(listBoxPanelElement, ANIMATION_HIDE_CLASS);
                            domClassName.add(listBoxPanelElement, ANIMATION_SHOW_CLASS);
                            this._clearAnimationRemoveTimeout();
                        }
                        domClassName.add(listBoxElement, OPENED_YES_CLASS);
                        domClassName.add(listBoxPanelElement, POPUP_SHOWN_CLASS);
                    } else {
                        this._expandMapEventsListeners.removeAll();
                        var needAnimation = false;
                        if (domClassName.has(listBoxElement, OPENED_YES_CLASS)) {
                            // Аналогично при скрытии.
                            domClassName.remove(listBoxPanelElement, ANIMATION_SHOW_CLASS);
                            domClassName.remove(listBoxElement, OPENED_YES_CLASS);
                            domClassName.remove(listBoxPanelElement, POPUP_SHOWN_CLASS);

                            needAnimation = true;
                        }
                        domClassName.add(listBoxElement, OPENED_NO_CLASS);
                        if (needAnimation) {
                            domClassName.add(listBoxPanelElement, ANIMATION_HIDE_CLASS);
                            this._clearAnimationRemoveTimeout();
                            this._setAnimationRemoveTimeout(listBoxPanelElement, ANIMATION_HIDE_CLASS);
                        }
                    }
                }
            },

            _setAnimationRemoveTimeout: function (element, className) {
                function removeAnimation () {
                    domClassName.remove(element, className);
                }

                this._animationRemoveTimeout = window.setTimeout(removeAnimation, 500);
            },

            _clearAnimationRemoveTimeout: function () {
                if (this._animationRemoveTimeout) {
                    window.clearTimeout(this._animationRemoveTimeout);
                }
            },

            _onMapSizeChange: function () {
                this._applySide();
                this._applyMaxHeight();
            },

            _setupHoldReaction: function () {
                this._holdReaction = reactionHold.reaction({
                    element: this._buttonElement,
                    targetElement: this._buttonElement,
                    toggleCssClass:  CSS_CLASS_PREFIX + '_pressed'
                });
            },

            _clearHoldReaction: function () {
                if (this._holdReaction) {
                    this._holdReaction.disable();
                }
            },

            _onShapeChange: function () {
                this._applySide();
            },

            _checkButtonAppearance: function () {
                var newAppearance = this._resolveAppearance();
                if (newAppearance != this._buttonAppearance) {
                    if (this._buttonAppearance) {
                        this._clearAppearance(this._buttonAppearance);
                    }
                    this._applyAppearance(newAppearance);
                }
                this._buttonAppearance = newAppearance;
            },

            _applyAppearance: function (appearance) {
                switch (appearance) {
                    case 'iconOnly':
                        domClassName.add(this._buttonElement, BUTTON_ICON_ONLY_CLASS);
                        if (this._buttonTitleElement) {
                            domStyle.css(this._buttonTitleElement, {
                                display: 'none'
                            });
                        }
                        this._applyIcon();
                        break;
                    case 'contentOnly':
                        domStyle.css(this._buttonIconElement, {
                            display: 'none'
                        });
                        break;
                    case 'iconWithContent':
                        this._applyIcon();
                        break;
                }
                // Из-за особенностей верстки, нужно выставить родительской ноде
                // явно ширину.
                this._setupControlWidth();
            },

            _clearAppearance: function (appearance) {
                switch (appearance) {
                    case 'iconOnly':
                        domClassName.remove(this._buttonElement, BUTTON_ICON_ONLY_CLASS);
                        if (this._buttonTitleElement) {
                            domStyle.css(this._buttonTitleElement, {
                                display: 'inline-block'
                            });
                        }
                        break;
                    case 'contentOnly':
                        domStyle.css(this._buttonIconElement, {
                            display: 'inline-block'
                        });
                        break;
                    case 'iconWithContent':
                        break;
                }
            },

            _setupControlWidth: function () {
                // Перед установкой размера нужно сбросить предыдущее значение.
                if (browser.oldIE) {
                    domStyle.css(this._listBoxElement, {
                        width: 'auto'
                    });
                }

                var width = domStyle.getSize(this._buttonElement, {
                    includePadding: true,
                    includeBorder: true
                })[0];

                // +1px для IE8
                if (browser.oldIE) {
                    width++;
                }

                domStyle.css(this._listBoxElement, {
                    width: width + "px"
                });
            },

            _applySide: function () {
                var control = this.getData().control,
                    customSide = control.options.get('popupFloat'),
                    side = control.options.get('float'),
                    position = control.options.get('position'),
                    alignRight;

                if ((side != 'none' && !position) || customSide) {
                    alignRight = (customSide || side) == 'right';
                } else {
                    var elementBounds = this.getParentElement().getBoundingClientRect(),
                        map = control.getMap(),
                        mapWidth = map.container.getSize()[0];

                    alignRight = elementBounds.left > (mapWidth / 2);
                }

                if (alignRight) {
                    domClassName.add(this._listBoxElement,  CSS_CLASS_PREFIX + 'listbox_align_right');
                    domClassName.add(this._listBoxPanelElement, POPUP_POSITION_LEFT_CLASS);
                } else {
                    domClassName.remove(this._listBoxElement,  CSS_CLASS_PREFIX + 'listbox_align_right');
                    domClassName.add(this._listBoxPanelElement, POPUP_POSITION_RIGHT_CLASS);
                }
            },

            _applyMaxHeight: function () {
                domStyle.css(this._selectListElement, {
                    maxHeight: "999999px"
                });
                domClassName.remove(this._selectListElement, SCROLLABLE_CLASS);

                var map = this.getData().control.getMap(),
                // Считаем отступ родительской ноды от документа.
                    clientBounds = this.getShape().getBounds(),

                // Считаем левый и правый отступы макета от карты.
                    maxHeight = map.container.getSize()[1] - clientBounds[1][1] - PANEL_PADDING,
                    realHeight = domStyle.getSize(this._listBoxPanelElement)[1];

                // В дефолтном браузере в Android есть баг - в абсолютно позиционированных элементах
                // при пропагировании клика не учитывается zIndex. Поэтому при клике на выпадающий список
                // клик проходит через список и доходит до карты.
                // Баг пропадает, если у списка есть вертикальный скролл.
                // Поэтому мы всегда искусственно вызываем скролл в списке и если он не нужен - кастомизируем
                // скролл так, чтобы он не был виден.
                if (realHeight - 1 < maxHeight && browser.osFamily == 'Android') {
                    if (!domClassName.has(this._listBoxPanelElement,  CSS_CLASS_PREFIX + 'hide-scroll')) {
                        domClassName.add(this._listBoxPanelElement,  CSS_CLASS_PREFIX + 'hide-scroll');
                        domClassName.remove(this._listBoxPanelElement,  CSS_CLASS_PREFIX + 'i-custom-scroll');
                    }
                    this._setMaxHeightAndClass(this._selectListElement, realHeight - 1);
                } else {
                    if (browser.osFamily == 'Android') {
                        domClassName.remove(this._listBoxPanelElement,  CSS_CLASS_PREFIX + 'hide-scroll');
                        domClassName.add(this._listBoxPanelElement,  CSS_CLASS_PREFIX + 'i-custom-scroll');
                    }
                    if (realHeight > maxHeight) {
                        this._setMaxHeightAndClass(this._selectListElement, maxHeight);
                    } else {
                        domStyle.css(this._selectListElement, {
                            maxHeight: maxHeight
                        });
                    }
                }
            },

            _resolveAppearance: function () {
                var state = this.getData().state,
                    data = this.getData().data,
                    hasImage = data.get('image') || data.get('iconType'),
                    hasContent = data.get('content'),
                    size = state.get('size');
                if ((size == 'small' && hasImage) || (!hasContent)) {
                    return 'iconOnly';
                } else if ((size == 'medium' && hasContent) || (!hasImage)) {
                    return 'contentOnly';
                } else {
                    return 'iconWithContent';
                }
            },

            _applyIcon: function () {
                var data = this.getData().data,
                    buttonIconClass =  CSS_CLASS_PREFIX + 'maps-button__icon_icon_';

                if (data.get('image')) {
                    if (this._iconType) {
                        domClassName.remove(this._buttonIconElement, buttonIconClass + this._iconType);
                        this._iconType = null;
                    }
                    domStyle.css(this._buttonIconElement, {
                        'backgroundImage': 'url("' + data.get('image') + '")'
                    });
                } else {
                    var newIconType = data.get('iconType');
                    if (this._iconType != newIconType) {
                        if (this._iconType) {
                            domClassName.remove(this._buttonIconElement, buttonIconClass + this._iconType);
                        }
                        domClassName.add(this._buttonIconElement, buttonIconClass + newIconType);
                        this._iconType = newIconType;
                    }
                }
            },

            _onChildLayoutChange: function () {
                this._applySide();
                this._applyMaxHeight();
            },

            _setMaxHeightAndClass: function (element, maxHeight) {
                maxHeight = Math.max(0, maxHeight);
                domStyle.css(element, {
                    maxHeight: maxHeight + 'px'
                });
                domClassName.add(element, SCROLLABLE_CLASS);
            }

        });

        provide(ListBoxLayout);
    }
});
