// src/pig.js
var ProgressiveImage = class {
  constructor(singleImageData, index, pig) {
    this.existsOnPage = false;
    this.aspectRatio = singleImageData.aspectRatio;
    this.filename = singleImageData.filename;
    this.index = index;
    this.pig = pig;
    this.classNames = {
      figure: `${pig.settings.classPrefix}-figure`,
      thumbnail: `${pig.settings.classPrefix}-thumbnail`,
      loaded: `${pig.settings.classPrefix}-loaded`
    };
    return this;
  }
  load() {
    this.existsOnPage = true;
    this._updateStyles();
    this.pig.container.appendChild(this.getElement());
    setTimeout(() => {
      if (!this.existsOnPage) {
        return;
      }
      this.addAllSubElements();
    }, 100);
  }
  hide() {
    if (this.getElement()) {
      this.removeAllSubElements();
    }
    if (this.existsOnPage) {
      this.pig.container.removeChild(this.getElement());
    }
    this.existsOnPage = false;
  }
  getElement() {
    if (!this.element) {
      this.element = document.createElement(this.pig.settings.figureTagName);
      this.element.className = this.classNames.figure;
      if (this.pig.settings.onClickHandler !== null) {
        this.element.addEventListener("click", () => {
          this.pig.settings.onClickHandler(this.filename);
        });
      }
      this._updateStyles();
    }
    return this.element;
  }
  addImageAsSubElement(subElementName, filename, size, classname = "") {
    let subElement = this[subElementName];
    if (!subElement) {
      this[subElementName] = new Image();
      subElement = this[subElementName];
      subElement.src = this.pig.settings.urlForSize(filename, size);
      if (classname.length > 0) {
        subElement.className = classname;
      }
      subElement.onload = () => {
        if (subElement) {
          subElement.className += ` ${this.classNames.loaded}`;
        }
      };
      this.getElement().appendChild(subElement);
    }
  }
  addAllSubElements() {
    this.addImageAsSubElement("thumbnail", this.filename, this.pig.settings.thumbnailSize, this.classNames.thumbnail);
    this.addImageAsSubElement("fullImage", this.filename, this.pig.settings.getImageSize(this.pig.lastWindowWidth));
  }
  removeSubElement(subElementName) {
    const subElement = this[subElementName];
    if (subElement) {
      subElement.src = "";
      this.getElement().removeChild(subElement);
      delete this[subElementName];
    }
  }
  removeAllSubElements() {
    this.removeSubElement("thumbnail");
    this.removeSubElement("fullImage");
  }
  _updateStyles() {
    this.getElement().style.transition = this.style.transition;
    this.getElement().style.width = `${this.style.width}px`;
    this.getElement().style.height = `${this.style.height}px`;
    this.getElement().style.transform = `translate3d(${this.style.translateX}px, ${this.style.translateY}px, 0)`;
  }
};
var OptimizedResize = class {
  constructor() {
    this._callbacks = [];
    this._running = false;
  }
  add(callback) {
    if (!this._callbacks.length) {
      window.addEventListener("resize", this._resize.bind(this));
    }
    this._callbacks.push(callback);
  }
  disable() {
    window.removeEventListener("resize", this._resize.bind(this));
  }
  reEnable() {
    window.addEventListener("resize", this._resize.bind(this));
  }
  _resize() {
    if (!this._running) {
      this._running = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(this._runCallbacks.bind(this));
      } else {
        setTimeout(this._runCallbacks.bind(this), 66);
      }
    }
  }
  _runCallbacks() {
    this._callbacks.forEach((callback) => {
      callback();
    });
    this._running = false;
  }
};
var PigSettings = class {
  constructor() {
    this.containerId = "pig";
    this.scroller = window;
    this.classPrefix = "pig";
    this.figureTagName = "figure";
    this.spaceBetweenImages = 8;
    this.transitionSpeed = 500;
    this.primaryImageBufferHeight = 1e3;
    this.secondaryImageBufferHeight = 300;
    this.thumbnailSize = 20;
    this.onClickHandler = null;
  }
  urlForSize(filename, size) {
    return `/img/${size.toString(10)}/${filename}`;
  }
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
  getImageSize(lastWindowWidth) {
    if (lastWindowWidth <= 640) {
      return 100;
    } else if (lastWindowWidth <= 1920) {
      return 250;
    }
    return 500;
  }
  createProgressiveImage(singleImageData, index, pig) {
    return new ProgressiveImage(singleImageData, index, pig);
  }
};
var Pig = class {
  constructor(imageData, options) {
    this._optimizedResize = new OptimizedResize();
    this.inRAF = false;
    this.isTransitioning = false;
    this.minAspectRatioRequiresTransition = false;
    this.minAspectRatio = null;
    this.latestYOffset = 0;
    this.lastWindowWidth = window.innerWidth;
    this.scrollDirection = "down";
    this.visibleImages = [];
    this.settings = Object.assign(new PigSettings(), options);
    this.container = document.getElementById(this.settings.containerId);
    if (!this.container) {
      console.error(`Could not find element with ID ${this.settings.containerId}`);
    }
    this.scroller = this.settings.scroller;
    this.images = this._parseImageData(imageData);
    this._injectStyle(this.settings.containerId, this.settings.classPrefix, this.settings.transitionSpeed);
    return this;
  }
  enable() {
    this.onScroll = this._getOnScroll();
    this.scroller.addEventListener("scroll", this.onScroll);
    this.onScroll();
    this._computeLayout();
    this._doLayout();
    this._optimizedResize.add(() => {
      this.lastWindowWidth = this.scroller === window ? window.innerWidth : this.scroller.offsetWidth;
      this._computeLayout();
      this._doLayout();
    });
    return this;
  }
  disable() {
    this.scroller.removeEventListener("scroll", this.onScroll);
    this._optimizedResize.disable();
    return this;
  }
  _parseImageData(imageData) {
    const progressiveImages = [];
    imageData.forEach((image, index) => {
      const progressiveImage = this.settings.createProgressiveImage(image, index, this);
      progressiveImages.push(progressiveImage);
    });
    return progressiveImages;
  }
  _getOffsetTop(elem) {
    let offsetTop = 0;
    do {
      if (!Number.isNaN(elem.offsetTop)) {
        offsetTop += elem.offsetTop;
      }
      elem = elem.offsetParent;
    } while (elem);
    return offsetTop;
  }
  _injectStyle(containerId, classPrefix, transitionSpeed) {
    const css = `#${containerId} {  position: relative;}.${classPrefix}-figure {  background-color: #D5D5D5;  overflow: hidden;  left: 0;  position: absolute;  top: 0;  margin: 0;}.${classPrefix}-figure img {  left: 0;  position: absolute;  top: 0;  height: 100%;  width: 100%;  opacity: 0;  transition: ${(transitionSpeed / 1e3).toString(10)}s ease opacity;  -webkit-transition: ${(transitionSpeed / 1e3).toString(10)}s ease opacity;}.${classPrefix}-figure img.${classPrefix}-thumbnail {  -webkit-filter: blur(30px);  filter: blur(30px);  left: auto;  position: relative;  width: auto;}.${classPrefix}-figure img.${classPrefix}-loaded {  opacity: 1;}`;
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
  }
  _getTransitionTimeout() {
    const transitionTimeoutScaleFactor = 1.5;
    return this.settings.transitionSpeed * transitionTimeoutScaleFactor;
  }
  _getTransitionString() {
    if (this.isTransitioning) {
      return `${(this.settings.transitionSpeed / 1e3).toString(10)}s transform ease`;
    }
    return "none";
  }
  _recomputeMinAspectRatio() {
    const oldMinAspectRatio = this.minAspectRatio;
    this.minAspectRatio = this.settings.getMinAspectRatio(this.lastWindowWidth);
    if (oldMinAspectRatio !== null && oldMinAspectRatio !== this.minAspectRatio) {
      this.minAspectRatioRequiresTransition = true;
    } else {
      this.minAspectRatioRequiresTransition = false;
    }
  }
  _computeLayout() {
    const wrapperWidth = parseInt(this.container.clientWidth, 10);
    let row = [];
    let translateX = 0;
    let translateY = 0;
    let rowAspectRatio = 0;
    this._recomputeMinAspectRatio();
    if (!this.isTransitioning && this.minAspectRatioRequiresTransition) {
      this.isTransitioning = true;
      setTimeout(() => {
        this.isTransitioning = false;
      }, this._getTransitionTimeout());
    }
    const transition = this._getTransitionString();
    [].forEach.call(this.images, (image, index) => {
      rowAspectRatio += parseFloat(image.aspectRatio);
      row.push(image);
      if (rowAspectRatio >= this.minAspectRatio || index + 1 === this.images.length) {
        rowAspectRatio = Math.max(rowAspectRatio, this.minAspectRatio);
        const totalDesiredWidthOfImages = wrapperWidth - this.settings.spaceBetweenImages * (row.length - 1);
        const rowHeight = totalDesiredWidthOfImages / rowAspectRatio;
        row.forEach((img) => {
          const imageWidth = rowHeight * img.aspectRatio;
          img.style = {
            width: parseInt(imageWidth, 10),
            height: parseInt(rowHeight, 10),
            translateX,
            translateY,
            transition
          };
          translateX += imageWidth + this.settings.spaceBetweenImages;
        });
        row = [];
        rowAspectRatio = 0;
        translateY += parseInt(rowHeight, 10) + this.settings.spaceBetweenImages;
        translateX = 0;
      }
    });
    this.totalHeight = translateY - this.settings.spaceBetweenImages;
  }
  _doLayout() {
    this.container.style.height = `${this.totalHeight}px`;
    const bufferTop = this.scrollDirection === "up" ? this.settings.primaryImageBufferHeight : this.settings.secondaryImageBufferHeight;
    const bufferBottom = this.scrollDirection === "down" ? this.settings.secondaryImageBufferHeight : this.settings.primaryImageBufferHeight;
    const containerOffset = this._getOffsetTop(this.container);
    const scrollerHeight = this.scroller === window ? window.innerHeight : this.scroller.offsetHeight;
    const minTranslateYPlusHeight = this.latestYOffset - containerOffset - bufferTop;
    const maxTranslateY = this.latestYOffset - containerOffset + scrollerHeight + bufferBottom;
    this.images.forEach((image) => {
      if (image.style.translateY + image.style.height < minTranslateYPlusHeight || image.style.translateY > maxTranslateY) {
        image.hide();
      } else {
        image.load();
      }
    });
  }
  _getOnScroll() {
    const that = this;
    const onScroll = () => {
      const newYOffset = that.scroller === window ? window.pageYOffset : that.scroller.scrollTop;
      that.previousYOffset = that.latestYOffset || newYOffset;
      that.latestYOffset = newYOffset;
      that.scrollDirection = that.latestYOffset > that.previousYOffset ? "down" : "up";
      if (!that.inRAF) {
        that.inRAF = true;
        window.requestAnimationFrame(() => {
          that._doLayout();
          that.inRAF = false;
        });
      }
    };
    return onScroll;
  }
};
export {
  Pig,
  ProgressiveImage
};
