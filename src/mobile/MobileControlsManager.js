import './mobile.css';
import { isMobileDevice } from './isMobile.js';
import { VirtualJoystick } from './VirtualJoystick.js';
import { TouchLookController } from './TouchLookController.js';
import { OrientationLock } from './OrientationLock.js';

/**
 * Mobile Controls Manager
 * - Master coordinator for mobile touch navigation
 * - Virtual joystick (bottom-left) + Swipe look (right side)
 * - Multitouch-safe simultaneous movement & camera rotation
 * - Mobile audio unlock integration on first user touch gesture
 * - Mandatory landscape orientation locking & portrait blocking
 * - Completely isolated from desktop controls
 */
export class MobileControlsManager {
  /**
   * @param {Object} controller Existing FirstPersonController instance
   * @param {HTMLElement} [container] Canvas/App container element
   */
  constructor(controller, container = document.body) {
    this.controller = controller;
    this.container = container;
    this.isMobile = isMobileDevice();
    this.overlay = null;
    this.joystick = null;
    this.lookController = null;
    this.orientationLock = null;
    this.enabled = true;

    if (this.isMobile) {
      this.init();
    }
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'mobile-controls-overlay';
    this.container.appendChild(this.overlay);

    // Audio unlock helper on initial mobile touch gesture
    const unlockAudioOnTouch = () => {
      if (window.__APP__ && window.__APP__.audio) {
        window.__APP__.audio.unlockAudio();
      }
    };

    // 1. Virtual Joystick (Bottom-Left)
    this.joystick = new VirtualJoystick(this.overlay, {
      maxRadius: 44,
      deadZone: 0.08,
      onStart: unlockAudioOnTouch,
    });

    // 2. Touch Look Controller (Right-Side Swipe)
    this.lookController = new TouchLookController(this.overlay, {
      sensitivity: 0.0034,
      onLook: (deltaYaw, deltaPitch) => {
        if (!this.enabled || !this.controller) return;
        this.controller.rotateLook(deltaYaw, deltaPitch);
      },
      onStart: unlockAudioOnTouch,
    });

    // 3. Mandatory Landscape Orientation Lock & Portrait Overlay
    this.orientationLock = new OrientationLock((isLandscape) => {
      this.handleOrientationChange(isLandscape);
    });

    // Adapt loading instructions if present
    this.updateLoadingInstructions();

    // Prevent mobile pull-to-refresh & navigation bounces
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
  }

  handleOrientationChange(isLandscape) {
    if (!isLandscape) {
      // Pause mobile gameplay input while in portrait
      this.enabled = false;
      if (this.joystick) this.joystick.reset();
      if (this.controller) this.controller.setMoveInput(0, 0);
      if (this.overlay) this.overlay.style.display = 'none';
    } else {
      // Resume mobile gameplay input when returned to landscape
      this.enabled = true;
      if (this.overlay) this.overlay.style.display = '';
    }
  }

  updateLoadingInstructions() {
    const instructionsEl = document.querySelector('.loading-instructions');
    if (instructionsEl) {
      instructionsEl.innerHTML = `
        <p><strong>Left Side</strong> — Touch joystick to move</p>
        <p><strong>Right Side</strong> — Swipe screen to look around</p>
      `;
    }
  }

  update() {
    if (!this.isMobile || !this.enabled || !this.joystick || !this.controller) return;

    // Feed joystick normalized vector directly to controller's movement inputs
    const moveX = this.joystick.value.x;
    const moveZ = this.joystick.value.y;

    this.controller.setMoveInput(moveX, moveZ);
  }

  dispose() {
    if (this.orientationLock) {
      this.orientationLock.dispose();
      this.orientationLock = null;
    }

    if (this.joystick) {
      this.joystick.dispose();
      this.joystick = null;
    }

    if (this.lookController) {
      this.lookController.dispose();
      this.lookController = null;
    }

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}
