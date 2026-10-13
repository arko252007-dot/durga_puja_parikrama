/**
 * Touch Look Controller Module for Mobile Camera Rotation
 * - Right-side swipe-to-look camera rotation
 * - Multitouch-safe: tracks dedicated camera touch ID without conflicting with joystick
 * - Prevents default mobile page scrolling and gesture navigation
 * - Smooth sensitivity tuned for mobile touch screens
 */
export class TouchLookController {
  /**
   * @param {HTMLElement} parentElement
   * @param {Object} [options]
   */
  constructor(parentElement, options = {}) {
    this.parent = parentElement;
    this.sensitivity = options.sensitivity || 0.0032;

    this.activeTouchId = null;
    this.lastX = 0;
    this.lastY = 0;

    this.onLook = options.onLook || null;
    this.onStart = options.onStart || null;
    this.onEnd = options.onEnd || null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.lookEl = document.createElement('div');
    this.lookEl.className = 'look-zone';
    this.parent.appendChild(this.lookEl);
  }

  bindEvents() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    const opts = { passive: false };

    this.lookEl.addEventListener('touchstart', this.onTouchStart, opts);
    window.addEventListener('touchmove', this.onTouchMove, opts);
    window.addEventListener('touchend', this.onTouchEnd, opts);
    window.addEventListener('touchcancel', this.onTouchEnd, opts);
  }

  onTouchStart(e) {
    if (this.activeTouchId !== null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.activeTouchId = touch.identifier;
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;

      if (this.onStart) this.onStart();
      break;
    }

    e.preventDefault();
  }

  onTouchMove(e) {
    if (this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        const deltaX = touch.clientX - this.lastX;
        const deltaY = touch.clientY - this.lastY;

        this.lastX = touch.clientX;
        this.lastY = touch.clientY;

        const deltaYaw = deltaX * this.sensitivity;
        const deltaPitch = deltaY * this.sensitivity;

        if (this.onLook) {
          this.onLook(deltaYaw, deltaPitch);
        }

        e.preventDefault();
        break;
      }
    }
  }

  onTouchEnd(e) {
    if (this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        this.activeTouchId = null;
        if (this.onEnd) this.onEnd();
        e.preventDefault();
        break;
      }
    }
  }

  dispose() {
    this.activeTouchId = null;
    const opts = { passive: false };

    this.lookEl.removeEventListener('touchstart', this.onTouchStart, opts);
    window.removeEventListener('touchmove', this.onTouchMove, opts);
    window.removeEventListener('touchend', this.onTouchEnd, opts);
    window.removeEventListener('touchcancel', this.onTouchEnd, opts);

    if (this.lookEl.parentNode) {
      this.lookEl.parentNode.removeChild(this.lookEl);
    }
  }
}
