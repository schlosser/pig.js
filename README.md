Progressive Image Grid (`pig.js`)
=================================
#### → → [Play with a demo][feeding-dan]

Arrange images in a responsive, progressive-loading grid managed in JavaScript using CSS transforms, with one lightweight library. Here's what you get:

1. **Performance**: The `pig.js` grid specializes in displaying a large number of photos. While a more traditional approaches would paginate images, or use AJAX to load and insert buckets of additional images onto the page, `pig.js` intelligently loads and unloads images as you scroll down the page, to ensure ensure speedy rendering of images, smooth scrolling, and minimal network activitiy. 
2. **Responsiveness**: Images are loaded in JavaScript, at different resolutions depending on screen size. Also, because images are positioned using CSS transforms, images smartly re-tile when you shrink or expand the browser window.
3. **User Experience**: Images are previewed with a small placeholder image that is scaled and blured.  When the image loads, it gives the effect that the image was brought into focus (it's super cool!).

A lot of this is stolen straight from Google Photos (by way of observation and some creative use of the Chrome Inspector) and Medium (by way of some [dope blog posts](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)).

If you want to see `pig.js` in action, check out the site that motivated it in the first place: a catalog of everything I ate in 2015: [feeding.schlosser.io][feeding-dan].  That site is also [on GitHub][feeding-dan-gh].

## Getting Started

#### Step 0: Install

[Download the latest release][download].

#### Step 1: Create your markup

```html
<!-- Include the pig.js library -->
<script src="/path/to/pig.min.js"></script>

<!-- Create a container element for the grid. -->
<div id="pig"></div>
```

#### Step 2: Create a structure to serve your images

Pig includes by default an easy method for handling responsive images at different screen sizes.  By default, Pig will attempt to request images with size (height in pixels) 100, 250, and 500.  It will also request a thumbnail 20px tall, which is used to create an effect of the blurred image coming into focus. 

###### Example: Serving Static Files

Create a directory structure like:

```bash
.
├── index.html
├── path
│   └── to
│       └── pig.min.js
├── img
│   ├── 20
│   |   ├── blue.jpg
│   |   ├── red.jpg
│   |   ...
│   |   
│   ├── 100
│   |   ├── blue.jpg
│   |   ├── red.jpg
│   |   ...
│   |   
│   ├── 250
│   |   ├── blue.jpg
│   |   ├── red.jpg
│   |   ...
│   |   
│   └── 500
│       ├── blue.jpg
│       ├── red.jpg
│       ...
...
```

And then set the `urlForSize` configuration option to account for this structure:

```javascript
var options = {
  urlForSize: function(filename, size) {
    return '/img/' + size + '/' + filename;
  },
  // ... 
};
```

#### Step 3: Create a new `Pig` instance, passing image data and options

```javascript
var imageData = [
  {filename: 'blue.jpg', aspectRatio: 1.777},
  {filename: 'red.jpg', aspectRatio: 1.5},
  {filename: 'green.jpg', aspectRatio: 1.777},
  {filename: 'orange.jpg', aspectRatio: 1.777},
  {filename: 'yellow.jpg', aspectRatio: 1},
  {filename: 'purple.jpg', aspectRatio: 2.4},
];

var options = {
  urlForSize: function(filename, size) {
    return '/img/' + size + '/' + filename;
  },
  // ... 
};

var pig = new Pig().enable(imageData, options);
```

## API

### Pig(_imageData_[, _options_])

The `Pig` constructor will setup a new progressive image grid instance. It returns a new instance of the `Pangea` class.

#### `imageData` _(array)_

**Note:** This argument is required.

A list of objects, one per image in the grid. In each object, the `filename` key gives the name of the image file and the `aspectRatio` key gives the aspect ratio of the image.  The below example shows how you would pass six images into the PIG:

```javascript
var imageData = [
  {filename: 'blue.jpg', aspectRatio: 1.777},
  {filename: 'red.jpg', aspectRatio: 1.5},
  {filename: 'green.jpg', aspectRatio: 1.777},
  {filename: 'orange.jpg', aspectRatio: 1.777},
  {filename: 'yellow.jpg', aspectRatio: 1},
  {filename: 'purple.jpg', aspectRatio: 2.4},
];
var options = { /* ... */ };
var pig = new Pig(imageData, options);
```

#### `options` _(object)_

You can customize the instance by passing the `options` parameter. The example below uses all options and their defaults: 

```javascript
var imageData = [ /* ... */ ];
var options = {
  containerId: 'pig',
  classPrefix: 'pig',
  figureTagName: 'figure',
  spaceBetweenImages: 8,
  transitionSpeed: 500,
  primaryImageBufferHeight: 1000,
  secondaryImageBufferHeight: 300,
  thumbnailSize: 20,
  urlForSize: function(filename, size) {
    return '/img/' + size + '/' + filename;
  },
  getMinAspectRatio: function(lastWindowWidth) {
    if (lastWindowWidth <= 640)  // Phones
      return 2;
    else if (lastWindowWidth <= 1280)  // Tablets
      return 4;
    else if (lastWindowWidth <= 1920)  // Laptops
      return 5;
    return 6;  // Large desktops
  },
  getImageSize: function(lastWindowWidth) {
    if (lastWindowWidth <= 640)  // Phones
      return 100;
    else if (lastWindowWidth <= 1920) // Tablets and latops
      return 250;
    return 500;  // Large desktops
  }
};
var pig = new Pig(imageData, options);
```

#### `options.containerId` _(string)_

The class name of the element inside of which images should be loaded.

> **Default**: `'pig'`

#### `options.classPrefix` _(string)_

The prefix associated with this library that should be prepended to class names within the grid.

> **Default**: `'pig'`

#### `options.figureTagName` _(string)_

The tag name to use for each figure. The default setting is to use a `<figure></figure>` tag.

> **Default**: `'figure'`

#### `options.spaceBetweenImages` _(number)_

Size in pixels of the gap between images in the grid.

> **Default**: `8`

#### `options.transitionSpeed` _(number)_

Transition speed in milliseconds.

> **Default**: `500`

#### `options.primaryImageBufferHeight` _(number)_

Height in pixels of images to preload in the direction that the user is scrolling. For example, in the default case, if the user is scrolling down, 1000px worth of images will be loaded below the viewport.

> **Default**: `1000`

#### `options.secondaryImageBufferHeight` _(number)_

Height in pixels of images to preload in the direction that the user is NOT scrolling. For example, in the default case, if the user is scrolling down, 300px worth of images will be loaded above the viewport.  Images further up will be removed.

> **Default**: `300`

#### `options.thumbnailSize` _(number)_

The height in pixels of the thumbnail that should be loaded and blurred to give the effect that images are loading out of focus and then coming into focus.
  
> **Default**: `20`

#### `options.urlForSize` _(function)_

Get the URL for an image with the given filename & size.

> **Parameters**:
>  - `filename` _(string)_ - The filename of the image.
>  - `size` _(number)_ - The size (height in pixels) of the image.
> 
> **Returns**:
> - _(string)_ - The URL of the image at the given size.
> 
> **Default**: 
> ```javascript
> function(filename, size) {
>   return '/img/' + size + '/' + filename;
> }
> ```

#### `options.getMinAspectRatio` _(function)_

Get the minimum required aspect ratio for a valid row of images. The perfect rows are maintained by building up a row of images by adding together their aspect ratios (the aspect ratio when they are placed next to each other) until that aspect ratio exceeds the value returned by this function. Responsive reordering is achieved through changes to what this function returns at different values of the passed parameter `lastWindowWidth`.

> **Parameters**:
> - `lastWindowWidth` _(number)_ - The last computed width of the browser window.
> 
> **Returns**: 
> - _(number)_ - The minimum aspect ratio at this window width.
> 
> **Default**: 
> ```javascript
> function(lastWindowWidth) {
>   if (lastWindowWidth <= 640)  // Phones
>     return 2;
>   else if (lastWindowWidth <= 1280)  // Tablets
>     return 4;
>   else if (lastWindowWidth <= 1920)  // Laptops
>     return 5;
>   return 6;  // Large desktops
> }
> ```

#### `options.getImageSize` _(function)_


Get the image size (height in pixels) to use for this window width. Responsive resizing of images is achieved through changes to what this function returns at different values of the passed parameter `lastWindowWidth`.

> **Parameters**:
> - `lastWindowWidth` _(number)_ - The last computed width of the browser window.
> 
> **Returns**: 
> - _(number)_ - The size (height in pixels) of the images to load.
> 
> **Default**: 
> ```javascript
> function(lastWindowWidth) {
>   if (lastWindowWidth <= 640)  // Phones
>     return 100;
>   else if (lastWindowWidth <= 1920) // Tablets and latops
>     return 250;
>   return 500;  // Large desktops
> }
> ```

### Pig.enable()

Enable the Pig library by beginning to listen to scroll and resize events, loading images and displaying them in the grid.

### Pig.disable()

Disable the Pig library by removing event listeners set in `Pig.enable()`.

[download]: https://github.com/schlosser/pig.js/releases/download/v0.2/pig.min.js
[feeding-dan]: https://feeding.schlosser.io/
[feeding-dan-gh]: https://github.com/schlosser/feeding-dan/
