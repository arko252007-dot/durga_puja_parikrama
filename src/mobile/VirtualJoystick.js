/**
 * Virtual Joystick Module for Mobile Movement
 * - Bottom-left analog movement input
 * - Multitouch-safe: tracks specific touch identifier
 * - Zero page scroll: prevents default browser touch behaviors
 * - Normalized -1 to +1 output vector with deadzone
 */
export class VirtualJoystick {
  /**
   * @param {HTMLElement} parentElement
   * @param {Object} [options]
   */
  constructor(parentElement, options = {}) {
    this.parent = parentElement;
    this.maxRadius = options.maxRadius || 42;
    this.deadZone = options.deadZone || 0.08;

    this.activeTouchId = null;
    this.center = { x: 0, y: 0 };
    this.value = { x: 0, y: 0 }; // Normalized output vector

    this.onStart = options.onStart || null;
    this.onEnd = options.onEnd || null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.zoneEl = document.createElement('div');
    this.zoneEl.className = 'joystick-zone';

    this.baseEl = document.createElement('div');
    this.baseEl.className = 'joystick-base';

    this.knobEl = document.createElement('div');
    this.knobEl.className = 'joystick-knob';

    this.baseEl.appendChild(this.knobEl);
    this.zoneEl.appendChild(this.baseEl);
    this.parent.appendChild(this.zoneEl);
  }

  bindEvents() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    // Passive false is crucial to prevent mobile viewport bounce & gestures
    const opts = { passive: false };

    this.zoneEl.addEventListener('touchstart', this.onTouchStart, opts);
    window.addEventListener('touchmove', this.onTouchMove, opts);
    window.addEventListener('touchend', this.onTouchEnd, opts);
    window.addEventListener('touchcancel', this.onTouchEnd, opts);
  }

  updateCenter() {
    const rect = this.baseEl.getBoundingClientRect();
    this.center.x = rect.left + rect.width / 2;
    this.center.y = rect.top + rect.height / 2;
  }

  onTouchStart(e) {
    if (this.activeTouchId !== null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.activeTouchId = touch.identifier;
      this.updateCenter();
      this.updateFromTouch(touch);
      this.baseEl.classList.add('active');

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
        this.updateFromTouch(touch);
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
        this.reset();
        e.preventDefault();
        break;
      }
    }
  }

  updateFromTouch(touch) {
    let dx = touch.clientX - this.center.x;
    let dy = touch.clientY - this.center.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.maxRadius) {
      dx = (dx / dist) * this.maxRadius;
      dy = (dy / dist) * this.maxRadius;
    }

    this.knobEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

    // Normalized vector [-1, 1]
    let normX = dx / this.maxRadius;
    let normY = dy / this.maxRadius;
    const normDist = Math.hypot(normX, normY);

    if (normDist < this.deadZone) {
      normX = 0;
      normY = 0;
    }

    this.value.x = normX;
    this.value.y = normY;
  }

  reset() {
    this.activeTouchId = null;
    this.value.x = 0;
    this.value.y = 0;
    this.knobEl.style.transform = 'translate3d(0, 0, 0)';
    this.baseEl.classList.remove('active');

    if (this.onEnd) this.onEnd();
  }

  dispose() {
    this.reset();
    const opts = { passive: false };

    this.zoneEl.removeEventListener('touchstart', this.onTouchStart, opts);
    window.removeEventListener('touchmove', this.onTouchMove, opts);
    window.removeEventListener('touchend', this.onTouchEnd, opts);
    window.removeEventListener('touchcancel', this.onTouchEnd, opts);

    if (this.zoneEl.parentNode) {
      this.zoneEl.parentNode.removeChild(this.zoneEl);
    }
  }
}
