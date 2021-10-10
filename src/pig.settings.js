import { ProgressiveImage } from './progressive.image.js';

export class PigSettings {
  constructor() {
    /**
     * Type: string
     * Default: 'pig'
     * Description: The class name of the element inside of which images should be loaded.
     */
    this.containerId = 'pig';

    /**
     * Type: window | HTMLElement
     * Default: window
     * Description: The window or HTML element that the grid scrolls in.
     */
    this.scroller = window;

    /**
     * Type: string
     * Default: 'pig'
     * Description: The prefix associated with this library that should be
     * !            prepended to class names within the grid.
     */
    this.classPrefix = 'pig';

    /**
     * Type: string
     * Default: 'figure'
     * Description: The tag name to use for each figure. The default setting is
     * !            to use a <figure></figure> tag.
     */
    this.figureTagName = 'figure';

    /**
     * Type: Number
     * Default: 8
     * Description: Size in pixels of the gap between images in the grid.
     */
    this.spaceBetweenImages = 8;

    /**
     * Type: Number
     * Default: 500
     * Description: Transition speed in milliseconds
     */
    this.transitionSpeed = 500;

    /**
     * Type: Number
     * Default: 3000
       * Description: Height in pixels of images to preload in the direction
       *   that the user is scrolling. For example, in the default case, if the
       *   user is scrolling down, 1000px worth of images will be loaded below
       *   the viewport.
     */
    this.primaryImageBufferHeight = 1000;

    /**
     * Type: Number
     * Default: 100
       * Description: Height in pixels of images to preload in the direction
       *   that the user is NOT scrolling. For example, in the default case, if
       *   the user is scrolling down, 300px worth of images will be loaded
       *   above the viewport.  Images further up will be removed.
     */
    this.secondaryImageBufferHeight = 300;

    /**
     * Type: Number
     * Default: 20
       * Description: The height in pixels of the thumbnail that should be
       *   loaded and blurred to give the effect that images are loading out of
       *   focus and then coming into focus.
     */
    this.thumbnailSize = 20;

    /**
     * Get a callback with the filename property of the image
     * which was clicked.
     * callback signature: function(filename) { ... }
     * 
     * @param {string} filename - The filename property of the image.
     */
    this.onClickHandler = null;
  }

  /**
   * Get the URL for an image with the given filename & size.
   * 
   * @param {string} filename - The filename of the image.
   * @param {Number} size - The size (height in pixels) of the image.
   * 
   * @returns {string} The URL of the image at the given size.
   */
  urlForSize(filename, size) {
    return '/img/' + size.toString(10) + '/' + filename;
  }

  /**
   * Get the minimum required aspect ratio for a valid row of images. The
   * perfect rows are maintained by building up a row of images by adding
   * together their aspect ratios (the aspect ratio when they are placed
   * next to each other) until that aspect ratio exceeds the value returned
   * by this function. Responsive reordering is achieved through changes
   * to what this function returns at different values of the passed
   * parameter `lastWindowWidth`.
   * @param {Number} lastWindowWidth - The last computed width of the browser window.
   * @returns {Number} The minimum aspect ratio at this window width.
   */
  getMinAspectRatio(lastWindowWidth) {
    if (lastWindowWidth <= 640) {
      return 2;
    } else if (lastWindowWidth <= 1280) {
      return 4;
    } else if (lastWindowWidth <= 1920) {
      return 5;
    }
    return 6;
  }

  /**
   * Get the image size (height in pixels) to use for this window width.
   * Responsive resizing of images is achieved through changes to what this
   * function returns at different values of the passed parameter
   * `lastWindowWidth`.
   * @param {Number} lastWindowWidth - The last computed width of the browser window.
   * @returns {Number} The size (height in pixels) of the images to load.
   */
  getImageSize(lastWindowWidth) {
    if (lastWindowWidth <= 640) {
      return 100;
    } else if (lastWindowWidth <= 1920) {
      return 250;
    }
    return 500;
  }

  /**
   * Factory function that creates a new instance of ProgressiveImage class.
   * @param {*} singleImageData - data of one image in data source
   * @param {number} index - index of image in data source
   * @param {*} pig - pig instance this image should contain to
   */
  createProgressiveImage(singleImageData, index, pig) {
    return new ProgressiveImage(singleImageData, index, pig);
  }
}
