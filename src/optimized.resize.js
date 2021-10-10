/**
 * This is a manager for our resize handlers. You can add a callback, disable
 * all resize handlers, and re-enable handlers after they have been disabled.
 *
 * optimizedResize is adapted from Mozilla code:
 * https://developer.mozilla.org/en-US/docs/Web/Events/resize
 */
export class OptimizedResize {
  constructor() {
    this._callbacks = [];
    this._running = false;
  }

  /**
   * Add a callback to be run on resize.
   * 
   * @param {function} callback - The callback to run on resize.
   */
  add(callback) {
    if (!this._callbacks.length) {
      window.addEventListener('resize', this._resize.bind(this));
    }

    this._callbacks.push(callback);
  }

  /**
   * Disables all resize handlers.
   */
  disable() {
    window.removeEventListener('resize', this._resize.bind(this));
  }

  /**
   * Enables all resize handlers, if they were disabled.
   */
  reEnable() {
    window.addEventListener('resize', this._resize.bind(this));
  }

  // fired on resize event
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

  // run the actual callbacks
  _runCallbacks() {
    this._callbacks.forEach(function(callback) {
      callback();
    });

    this._running = false;
  }
}
