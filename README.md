Progressive Image Grid (`pig.js`)
=================================

[![npm](https://img.shields.io/npm/v/pig.js.svg)](https://www.npmjs.com/package/pig.js) [![Bower](https://img.shields.io/bower/v/pig.js.svg)]()

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

var pig = new Pig(imageData, options).enable();
```

## Custom layout

This section shows the basics of how to customize the \<figure> tags that make up the PIG. The full code can be seen in the `/test` directory of this project,.

Step 0, step 1 and step 2 of 'Getting Started' remain unchanged.

#### Step 3: Create your markup and extend the pig classes

Add values to the imageData element

```javascript
var imageData = [
  {"filename":"2015-01-01.19.47.28.jpg","aspectRatio":1.7777, imageDate: '14.04.2019', description: 'salad'},
  {"filename":"2015-01-01.21.11.37.jpg","aspectRatio":1.7777, imageDate: '14.04.2019', description: 'cookies'},
  {"filename":"2015-01-02.20.03.26.jpg","aspectRatio":1.7777, imageDate: '14.04.2019', description: 'finished'},
  {"filename":"2015-01-02.23.19.25.jpg","aspectRatio":0.5625, imageDate: '15.04.2019', description: 'icecream for me'},
  {"filename":"2015-01-03.20.12.35.jpg","aspectRatio":0.5625, imageDate: '15.04.2019', description: 'current food 1'},
  {"filename":"2015-01-03.21.18.58.jpg","aspectRatio":0.5625, imageDate: '15.04.2019', description: 'current food 2'},
  {"filename":"2015-01-04.12.39.47.jpg","aspectRatio":1.7777, imageDate: '16.04.2019', description: 'current food 3'}
];
```

Extend the `ProgressiveImage` class

```javascript
class ProgressiveImageCustom extends ProgressiveImage {
  constructor(singleImageData, index, pig) {
    super(singleImageData, index, pig);

    // Additional data for ProgressiveImage instance
    this.imageDate = singleImageData.imageDate;  // Date taken
    this.description = singleImageData.description;  // What to see

    this.classNames.date = pig.settings.classPrefix + '-date';
    this.classNames.desc = pig.settings.classPrefix + '-desc';
  }

  /**
   * Add a div tag as a subelement to the <figure> tag.
   * @param {string} subElementName - name of the subelement
   * @param {string} content - static content of the div tag
   * @param {string} classname - name of the class to be added to the new subelement (default value='' - i.e. no class added)
   */
   addDivAsSubElement(subElementName, content, classname = '') {
    let subElement = this[subElementName];
    if (!subElement) {
      this[subElementName] = document.createElement('div');
      let subElement = this[subElementName];
      subElement.innerHTML = content;
      if (classname.length > 0) {
        subElement.className = classname;
      }
      this.getElement().appendChild(subElement);
    }
  }

  /**
   * Modify layout of image by adding 2 div tags to the structure created
   * by the base class.
   */
  addAllSubElements() {
    super.addAllSubElements();

    // Add div for date
    this.addDivAsSubElement('date', this.imageDate, `${this.classNames.date} pig-overlay`);

    // Add div for desc
    this.addDivAsSubElement('desc', this.description, `${this.classNames.desc} pig-overlay`);

    // Modify default element generated by base class
    if (this.fullImage) {
      this.fullImage.title = this.description;
      // Overwrite eventhandler as we must show custom fields too, when image is loaded
      this.fullImage.onload = () => {
        // We have to make sure fullImage still exists, we may have already been
        // deallocated if the user scrolls too fast.
        if (this.fullImage) {
          this.fullImage.className += ' ' + this.classNames.loaded;
        }
        if (this.date) {
          this.date.className += ' ' + this.classNames.loaded;
        }
        if (this.desc) {
          this.desc.className += ' ' + this.classNames.loaded;
        }
      };
    }
  }

  /**
   * Remove all elements of image - required by pig system.
   */
  removeAllSubElements() {
    super.removeAllSubElements();
    this.removeSubElement('date');
    this.removeSubElement('desc');
  }
}
```

Add required css classes to the `Pig` class

```javascript
class PigCustom extends Pig {
  _injectStyle(containerId, classPrefix, transitionSpeed)  {
    super._injectStyle(containerId, classPrefix, transitionSpeed);
    const customCss = `.pig-date { background-color: rgba(128, 128, 128, 0.35); color: white; font-size: 11px; opacity: 0; padding: 0 4px; position: absolute; top: 0; }
    .pig-desc {background-color: rgba(128, 128, 128, 0.35); bottom: 0; color: white; font-size: 11px; overflow: hidden; padding: 0 4px; opacity: 0; position: absolute; white-space: nowrap; }
    .pig-figure div.pig-loaded { opacity: 1; }`;

    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(customCss));
    head.appendChild(style);
  }
}
```

Set required pig options and create a new `Pig` instance, passing image data and options

```javascript
const pigOptions = {
  urlForSize: (filename, size) => `https://feeding.schlosser.io/img/food/${size}/${filename}`,
  onClickHandler: (filename) => window.open(`https://feeding.schlosser.io/img/food/250/${filename}`, '_blank'),
  createProgressiveImage: (singleImageData, index, pig) => new ProgressiveImageCustom(singleImageData, index, pig)
};

const pig = new PigCustom(imageData, pigOptions).enable();
```

## API

### Pig(_imageData_[, _options_])

The `Pig` constructor will setup a new progressive image grid instance. It returns a new instance of the `Pig` class.

#### `imageData` _(array)_

**Note:** This argument is required.

A list of objects, one per image in the grid. In each object, the `filename` key gives the name of the image file and the `aspectRatio` key gives the aspect ratio of the image. More keys can be added for derived `Pig` classes. The below example shows how you would pass six images into the PIG:

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
  onClickHandler: null,
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

#### `options.onClickHandler` _(function)_

Add callback function which is called, when a image is clicked with the image name. By default this is null.

> **Parameters**
> - `filename` _(string)_ - The name of the clicked image
>
> **Default**: null

#### `options.createProgressiveImage` _(function)_

Factory function that creates a new instance of the ProgressiveImage class.

> **Parameters**
> - `singleImageData` _(object)_ - Data of one image in data source
> - `index` _(number)_ - Index of the image in the data source
> - `pig` _(object)_ - Pig instance, that should contain this image
>
> **Default**
> function(singleImageData, index, pig) { return new ProgressiveImage(singleImageData, index, pig) }

### Pig.enable()

Enable the Pig library by beginning to listen to scroll and resize events, loading images and displaying them in the grid.

### Pig.disable()

Disable the Pig library by removing event listeners set in `Pig.enable()`.

[download]: https://github.com/schlosser/pig.js/releases/download/v0.3/pig.min.js
[feeding-dan]: https://feeding.schlosser.io/
[feeding-dan-gh]: https://github.com/schlosser/feeding-dan/

### ProgressiveImage(__singleImageData__, __index__, __pig__)

The `ProgressiveImage` constructor will setup a new progressive image instance that represents 1 image in the grid. It returns a new instance of the `ProgressiveImage` class.

#### `singleImageData` _(object)_

An object from the list of imageData, representing one image in the grid.

> **Keys**:
> - `filename` _(string)_ - The name of the image file. **Required**
> - `aspectRatio` _(number)_ - The aspect ratio of the image. **Required**
> - More keys can be added for derived `ProgressiveImage` classes.

#### `index` _(number)_

The index of this image in the list of images (zero based).

#### `pig` _(object)_

The reference to the `Pig` instance, this `ProgressiveImage` image belongs to.

### ProgressiveImage.addAllSubElements _(function)

Add all subelements that make up an image in the PIG.
Uses `addImageAsSubElement` to insert subelements like images or div tags.

> **Default**:
> ```javascript
> addAllSubElements() {
>   // Add thumbnail
>   this.addImageAsSubElement('thumbnail',
>                             this.filename,
>                             this.pig.settings.>thumbnailSize,
>                             this.classNames.thumbnail);
>
>   // Add full image
>   this.addImageAsSubElement('fullImage',
>                             this.filename,
>                             this.pig.settings.getImageSize(
>                                        this.pig.lastWindowWidth));
> }
> ```

### ProgressiveImage.addImageAsSubElement _(function)

Add an imgage as a subelement to the \<figure> tag representing this image.  
This function is (only) called by `ProgressiveImage.addAllSubElements`. Therefore the signature can be anything needed.

> **Default**:
> ```javascript
> addImageAsSubElement(subElementName, filename, size, classname = '') {
>   let subElement = this[subElementName];
>   if (!subElement) {
>     this[subElementName] = new Image();
>     subElement = this[subElementName];
>     subElement.src = this.pig.settings.urlForSize(filename, size);
>     if (classname.length > 0) {
>       subElement.className = classname;
>     }
>     subElement.onload = () => {
>       // We have to make sure that the thumbnail still exists; we may
>       // have been already deallocating it, if the user scrolls too fast.
>       if (subElement) {
>         subElement.className += ' ' + this.classNames.loaded;
>       }
>     };
>
>     this.getElement().appendChild(subElement);
>   }
> }
> ```

### ProgressiveImage.removeAllSubElements _(function)

Remove all subelements that make up an image in the PIG.
Uses `removeSubElement` to remove the subelements like images or div tags.

> **Default**:
> ```javascript
> removeAllSubElements() {
>   this.removeSubElement('thumbnail');
>   this.removeSubElement('fullImage');
> }
> ```

### ProgressiveImage.removeSubElement _(function)

Remove a subelement of the \<figure> tag (e.g. an image element).  
This function is (only) called by `ProgressiveImage.removeAllSubElements`. Therefore the signature can be anything needed.

> **Default**:
> ```javascript
> removeSubElement(subElementName) {
>   const subElement = this[subElementName];
>   if (subElement) {
>     subElement.src = '';
>     this.getElement().removeChild(subElement);
>     delete this[subElementName];
>   }
> }
> ```
