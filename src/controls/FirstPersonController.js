import * as THREE from 'three';

/**
 * First-Person Player Controller:
 * - Responsive WASD movement relative to camera yaw.
 * - Smooth mouse look with pointer lock integration.
 * - Pitch clamped between -85 deg and +85 deg.
 * - Robust AABB circle-box collision detection with slide physics.
 * - Continuous floor elevation support (Y = 0.0 outside in mela; smooth ramp/step to Y = 0.65m inside pandal).
 * - Human eye height: 1.70m.
 * - Clean Escape key release and zero gameplay HUD clutter.
 */

export class FirstPersonController {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @param {THREE.Box3[]} colliders Static world collision boxes
   */
  constructor(camera, domElement, colliders = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;

    // Player physical parameters
    this.radius = 0.35; // 35cm collision radius
    this.eyeHeight = 1.70; // 1.7m human eye height
    this.walkSpeed = 3.6; // ~3.6 m/s walking speed
    this.position = new THREE.Vector3(0, this.eyeHeight, 22.0); // Start on mela walkway facing pandal

    // Camera orientation (Euler angles: pitch and yaw)
    this.yaw = 0; // 0 rad faces -Z (toward pandal)
    this.pitch = 0;
    this.mouseSensitivity = 0.0022;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.touchMoveX = 0;
    this.touchMoveZ = 0;
    this.isLocked = false;
    this.enabled = true;

    // Bind event handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onPointerlockChange = this.onPointerlockChange.bind(this);
    this.onClick = this.onClick.bind(this);

    this.attachEventListeners();
    this.updateCameraTransform();
  }

  reset() {
    this.setPosition(0, this.eyeHeight, 22.0, 0, 0);
  }

  attachEventListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerlockChange);
    this.domElement.addEventListener('click', this.onClick);
  }

  onClick() {
    if (window.__APP__ && window.__APP__.audio) {
      window.__APP__.audio.unlockAudio();
    }
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches;
    if (!this.isLocked && this.enabled && !isTouchOnly) {
      this.domElement.requestPointerLock();
    }
  }

  onPointerlockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
    if (this.isLocked && window.__APP__ && window.__APP__.audio) {
      window.__APP__.audio.unlockAudio();
    }
  }

  onKeyDown(e) {
    if (window.__APP__ && window.__APP__.audio) {
      window.__APP__.audio.unlockAudio();
    }
    if (!this.enabled) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'KeyR':
        this.reset();
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
    }
  }

  onMouseMove(e) {
    if (!this.isLocked || !this.enabled) return;

    this.yaw += e.movementX * this.mouseSensitivity;
    this.pitch -= e.movementY * this.mouseSensitivity;

    // Clamp pitch to prevent camera flipping (-85 deg to +85 deg)
    const maxPitch = Math.PI / 2 - 0.08;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    this.updateCameraTransform();
  }

  /**
   * Sets external movement input vector (e.g. from mobile virtual joystick).
   * @param {number} x Normalized horizontal input [-1, 1]
   * @param {number} z Normalized forward/backward input [-1, 1]
   */
  setMoveInput(x, z) {
    this.touchMoveX = x;
    this.touchMoveZ = z;
  }

  /**
   * Rotates camera look angles (e.g. from mobile touch swipe).
   * @param {number} deltaYaw Yaw rotation delta
   * @param {number} deltaPitch Pitch rotation delta
   */
  rotateLook(deltaYaw, deltaPitch) {
    if (!this.enabled) return;

    this.yaw += deltaYaw;
    this.pitch -= deltaPitch;

    // Clamp pitch to prevent camera flipping (-85 deg to +85 deg)
    const maxPitch = Math.PI / 2 - 0.08;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    this.updateCameraTransform();
  }

  /**
   * Calculates ground floor elevation at given (x, z) coordinates.
   * Handles seamless transition from mela ground (Y = 0) up the entrance stairs to pandal floor (Y = 0.65m).
   */
  getFloorHeight(x, z) {
    // Inside the pandal interior or entrance tunnel (Z <= -2.0)
    if (z <= -2.0 && Math.abs(x) <= 9.0) {
      return 0.65;
    }

    // Entrance steps transition zone (Z between -2.0 and 0.0)
    if (z > -2.0 && z <= 0.0 && Math.abs(x) <= 7.0) {
      const t = (0.0 - z) / 2.0; // 0 to 1
      return t * 0.65;
    }

    // Outside mela ground
    return 0.0;
  }

  /**
   * Circle-to-AABB collision check with sliding response.
   * @param {THREE.Vector3} oldPos
   * @param {THREE.Vector3} newPos
   * @returns {THREE.Vector3} Resolved valid position
   */
  resolveCollisions(oldPos, newPos) {
    const resolved = newPos.clone();
    const r = this.radius;

    // Check against all registered static AABB colliders
    for (const box of this.colliders) {
      // Check height range overlap
      if (resolved.y < box.min.y || resolved.y - this.eyeHeight > box.max.y) {
        continue;
      }

      // Check 2D bounding box expansion by player radius
      if (
        resolved.x + r > box.min.x &&
        resolved.x - r < box.max.x &&
        resolved.z + r > box.min.z &&
        resolved.z - r < box.max.z
      ) {
        // Find penetration depth along X and Z
        const penX1 = (resolved.x + r) - box.min.x;
        const penX2 = box.max.x - (resolved.x - r);
        const minPenX = Math.min(penX1, penX2);

        const penZ1 = (resolved.z + r) - box.min.z;
        const penZ2 = box.max.z - (resolved.z - r);
        const minPenZ = Math.min(penZ1, penZ2);

        // Slide along axis of least penetration
        if (minPenX < minPenZ) {
          resolved.x = penX1 < penX2 ? box.min.x - r : box.max.x + r;
        } else {
          resolved.z = penZ1 < penZ2 ? box.min.z - r : box.max.z + r;
        }
      }
    }

    return resolved;
  }

  update(delta) {
    if (!this.enabled) return;

    // Compute input direction in local camera horizontal space (combines touch joystick & WASD)
    let moveX = this.touchMoveX || 0;
    let moveZ = this.touchMoveZ || 0;

    if (this.moveForward) moveZ -= 1;
    if (this.moveBackward) moveZ += 1;
    if (this.moveLeft) moveX -= 1;
    if (this.moveRight) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ);
      if (len > 1.0) {
        moveX /= len;
        moveZ /= len;
      }

      const sinY = Math.sin(this.yaw);
      const cosY = Math.cos(this.yaw);

      const fwdX = sinY;
      const fwdZ = -cosY;
      const rgtX = cosY;
      const rgtZ = sinY;

      const worldDX = (moveX * rgtX + (-moveZ) * fwdX) * this.walkSpeed * delta;
      const worldDZ = (moveX * rgtZ + (-moveZ) * fwdZ) * this.walkSpeed * delta;

      const targetPos = this.position.clone();
      targetPos.x += worldDX;
      targetPos.z += worldDZ;

      // Update vertical height with ground elevation
      const floorH = this.getFloorHeight(targetPos.x, targetPos.z);
      targetPos.y = floorH + this.eyeHeight;

      // Resolve collisions
      const resolved = this.resolveCollisions(this.position, targetPos);
      this.position.copy(resolved);
    } else {
      // Ensure player maintains correct floor height even when static
      const floorH = this.getFloorHeight(this.position.x, this.position.z);
      this.position.y = floorH + this.eyeHeight;
    }

    this.updateCameraTransform();
  }

  updateCameraTransform() {
    this.camera.position.copy(this.position);

    // Compute look-at direction from yaw and pitch
    const dir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    );

    const target = this.position.clone().add(dir);
    this.camera.lookAt(target);
  }

  setPosition(x, y, z, yaw = 0, pitch = 0) {
    this.position.set(x, y, z);
    this.yaw = yaw;
    this.pitch = pitch;
    this.updateCameraTransform();
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerlockChange);
    this.domElement.removeEventListener('click', this.onClick);
  }
}
