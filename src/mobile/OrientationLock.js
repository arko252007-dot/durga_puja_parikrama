import { isMobileDevice } from './isMobile.js';

/**
 * Orientation Lock Manager for Mobile Devices
 * - Enforces mandatory landscape orientation on mobile/tablet devices
 * - Attempts programmatic screen.orientation.lock("landscape") where supported
 * - Displays minimal fullscreen overlay when device is in portrait mode
 * - Pauses gameplay inputs while in portrait, resumes on landscape
 * - Safe fallbacks for iOS Safari and browsers requiring user gesture or fullscreen
 */
export class OrientationLock {
  /**
   * @param {Function} [onOrientationChange] Callback receiving (isLandscape: boolean)
   */
  constructor(onOrientationChange = null) {
    this.isMobile = isMobileDevice();
    this.onOrientationChange = onOrientationChange;
    this.overlay = null;
    this.landscapeCallbacks = [];
    this.hasAttemptedLock = false;

    if (this.isMobile) {
      this.init();
    }
  }

  isPortrait() {
    if (!this.isMobile) return false;
    if (window.matchMedia && window.matchMedia('(orientation: portrait)').matches) {
      return true;
    }
    return window.innerHeight > window.innerWidth;
  }

  isLandscape() {
    return !this.isPortrait();
  }

  init() {
    this.initOverlay();
    this.bindEvents();
    this.attemptScreenLock();
    this.checkOrientation();
  }

  initOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'orientation-lock-overlay';
    this.overlay.className = 'orientation-lock-overlay';

    this.overlay.innerHTML = `
      <div class="orientation-lock-content">
        <svg class="orientation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M12 18h.01" />
          <path d="M17 9l3-3m0 0l-3-3m3 3H12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="orientation-text">Please rotate your device to landscape to play.</p>
      </div>
    `;

    document.body.appendChild(this.overlay);
  }

  bindEvents() {
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);

    if (screen && screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener('change', this.onResize);
    }

    // Try programmatic lock again on first permitted user interaction
    const onFirstTouch = () => {
      this.attemptScreenLock();
      window.removeEventListener('touchstart', onFirstTouch);
      window.removeEventListener('pointerdown', onFirstTouch);
    };

    window.addEventListener('touchstart', onFirstTouch, { passive: true });
    window.addEventListener('pointerdown', onFirstTouch, { passive: true });
  }

  async attemptScreenLock() {
    if (!this.isMobile) return false;

    if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.lock === 'function') {
      try {
        await screen.orientation.lock('landscape');
        console.log('[Orientation] Programmatic screen orientation locked to landscape');
        this.hasAttemptedLock = true;
        return true;
      } catch (err) {
        // Expected fallback on iOS Safari or when user gesture / fullscreen is required by browser
        console.log('[Orientation] screen.orientation.lock not permitted or unsupported by this browser:', err.message);
        return false;
      }
    }
    return false;
  }

  onResize() {
    this.checkOrientation();
  }

  checkOrientation() {
    if (!this.isMobile || !this.overlay) return;

    const inPortrait = this.isPortrait();

    if (inPortrait) {
      this.overlay.classList.remove('hidden');
      if (this.onOrientationChange) {
        this.onOrientationChange(false);
      }
    } else {
      this.overlay.classList.add('hidden');
      if (this.onOrientationChange) {
        this.onOrientationChange(true);
      }

      // Fire any pending landscape resolution callbacks
      while (this.landscapeCallbacks.length > 0) {
        const cb = this.landscapeCallbacks.shift();
        try { cb(); } catch (e) {}
      }
    }
  }

  /**
   * Registers a callback that fires when device enters landscape orientation.
   * If already in landscape, fires immediately.
   */
  onLandscape(callback) {
    if (!this.isMobile || this.isLandscape()) {
      callback();
    } else {
      this.landscapeCallbacks.push(callback);
    }
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);

    if (screen && screen.orientation && screen.orientation.removeEventListener) {
      screen.orientation.removeEventListener('change', this.onResize);
    }

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }

    this.landscapeCallbacks = [];
  }
}
