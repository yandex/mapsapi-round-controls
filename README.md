# Round map controls theme
## Plugin for Yandex.Maps JS API

<img src="screenshot.jpg" width=640 height=320>

## Demo
http://yandex.github.io/mapsapi-round-controls/

## How to use?

1. Download the source code: [`build/release/all.js`](build/release/all.js).
2. Add it to your page below Yandex.Maps JS API `<script>` tag.
3. Create controls with `round#`... layout keys.
 
### Button

| Param                        | Value
| ---------------------------- | ----------------------------------
| `parameters.data.iconType`   | [List of available icons](docs/icons.md)  
| `parameters.options.layout`  | `round#buttonLayout`


```js
// Example with preset icon image
var button = new ymaps.control.Button({
    data: {
        iconType: 'loupe',
        title: 'Button Text'
    },
    options: {
        layout: 'round#buttonLayout',
        maxWidth: 120
    }
});
myMap.controls.add(button);
```

```js
// Example with custom icon image
var button = new ymaps.control.Button({
    data: {
        image: 'path_to/image.svg',
        title: 'Button Text'
    },
    options: {
        layout: 'round#buttonLayout',
        maxWidth: 120
    }
});
myMap.controls.add(button);
```

For more info visit https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.Button-docpage/


### Geolocation

| Param                        | Value
| ---------------------------- | --------------------
| `parameters.options.layout`  | `round#buttonLayout`

```js
// Example
var geolocationControl = new ymaps.control.GeolocationControl({
    options: {
        layout: 'round#buttonLayout'
    }
});
myMap.controls.add(geolocationControl);
```

For more info visit https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.GeolocationControl-docpage/

### Ruler

| Param                        | Value
| ---------------------------- | --------------------
| `parameters.options.layout`  | `round#rulerLayout`

```js
// Example
var rulerControl = new ymaps.control.RulerControl({
    options: {
        layout: 'round#rulerLayout'
    }
});
myMap.controls.add(rulerControl);
```

For more info visit  https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.RulerControl-docpage/

### TypeSelector

| Param                                      | Value
| ------------------------------------------ | --------------------
| `parameters.options.layout`                | `round#listBoxLayout`
| `parameters.options.itemLayout`            | `round#listBoxItemLayout`
| `parameters.options.itemSelectableLayout`  | `round#listBoxItemSelectableLayout`


```js
// Example: TypeSelector on the left side
var typeSelector = new ymaps.control.TypeSelector({
    options: {
        layout: 'round#listBoxLayout',
        itemLayout: 'round#listBoxItemLayout',
        itemSelectableLayout: 'round#listBoxItemSelectableLayout',
        float: 'none',
        position: {
            bottom: '40px',
            left: '10px'
        }
    }
});
myMap.controls.add(typeSelector);
```

```js
// Example: TypeSelector on the right side
var typeSelector = new ymaps.control.TypeSelector({
    options: {
        layout: 'round#listBoxLayout',
        itemLayout: 'round#listBoxItemLayout',
        itemSelectableLayout: 'round#listBoxItemSelectableLayout',
        float: 'none',
        position: {
            bottom: '40px',
            right: '10px'
        }
    }
});
myMap.controls.add(typeSelector);
```

For more info visit https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.TypeSelector-docpage/

### Zoom

| Param                        | Value
| ---------------------------- | --------------------
| `parameters.options.layout`  | `round#buttonLayout`

```js
// Example 
var zoomControl = new ymaps.control.ZoomControl({
    options: {
        layout: 'round#zoomLayout'
    }
});
myMap.controls.add(zoomControl);
```

For more info visit https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.ZoomControl-docpage/


## Building
Use [ymb](https://www.npmjs.org/package/ymb) if re-build is needed.
