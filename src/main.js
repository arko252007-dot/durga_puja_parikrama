import * as THREE from 'three';
import { createRenderer } from './app/createRenderer.js';
import { createScene } from './app/createScene.js';
import { createLighting } from './lighting/LightingSetup.js';
import { createGround } from './world/Ground.js';
import { createExterior } from './world/Exterior.js';
import { createInterior } from './world/Interior.js';
import { createDurgaTableau } from './idol/DurgaTableau.js';
import { createCrowd } from './crowd/CrowdManager.js';
import { createMelaGround } from './mela/MelaGround.js';
import { FirstPersonController } from './controls/FirstPersonController.js';
import { SpatialAudioManager } from './audio/SpatialAudioManager.js';
import { MobileControlsManager } from './mobile/MobileControlsManager.js';
import { isMobileDevice } from './mobile/isMobile.js';
import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject();

class Application {
  constructor() {
    this.container = document.getElementById('canvas-container');
    if (!this.container) {
      throw new Error('Canvas container #canvas-container not found in DOM');
    }

    // 1. Scene setup
    this.scene = createScene();

    // 2. Camera setup configured for human eye height (~1.7m)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 500);

    // Initial viewpoint: standing on approach plaza path (Z = 22m), looking at grand exterior facade
    this.camera.position.set(0, 1.7, 22.0);
    this.camera.lookAt(0, 5.0, -6.0);

    // 3. Renderer setup
    this.rendererManager = createRenderer(this.container);
    this.renderer = this.rendererManager.renderer;

    // 4. Lighting setup
    this.lighting = createLighting(this.scene);

    // 5. Ground plane & plaza base
    this.ground = createGround(this.scene);

    // 6. Complete Explorable Durga Puja Mela Ground (Phase 6)
    this.mela = createMelaGround(this.scene);

    // 7. Grand Pandal Exterior Architecture (Phase 2)
    this.exterior = createExterior(this.scene);

    // 8. Grand Pandal Interior Architecture (Phase 3)
    this.interior = createInterior(this.scene);

    // 9. Maa Durga Pratima and Complete Tableau (Phase 4)
    this.tableau = createDurgaTableau(this.scene);

    // 10. Realistic Moving Crowd System (Phase 5)
    this.crowd = createCrowd(this.scene);

    // 11. First-Person Player Controller (Phase 6)
    this.controller = new FirstPersonController(
      this.camera,
      this.renderer.domElement,
      this.mela.colliders
    );
    this.controller.enabled = false; // Enabled after loading completes

    // 12. 3D Spatial Audio Soundscape
    this.audio = new SpatialAudioManager(
      this.camera,
      this.scene,
      this.container
    );

    // 13. Mobile Touch Controls (Virtual Joystick & Touch Look)
    this.mobileControls = new MobileControlsManager(
      this.controller,
      this.container
    );

    // 14. Timing & Animation state
    this.lastTime = performance.now();
    this.animationFrameId = null;
    this.isRunning = false;
    this.frameCount = 0;

    // 13. Event listeners
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);
    window.addEventListener('resize', this.onResize);

    // 11. Comprehensive Camera Presets for exterior, interior, and tableau QA inspection
    this.cameraPresets = {
      // Exterior viewpoints (Phase 2)
      farFront: { pos: [0, 1.7, 26.0], target: [0, 8.0, -6.0] },
      closerFront: { pos: [0, 1.7, 12.0], target: [0, 5.0, -6.0] },
      nearEntrance: { pos: [0, 1.7, 1.0], target: [0, 3.2, -6.0] },
      angledSide: { pos: [18.0, 3.0, 12.0], target: [0, 6.0, -6.0] },
      obliqueLeft: { pos: [-16.0, 2.5, 8.0], target: [0, 5.0, -6.0] },
      overhead: { pos: [0, 25.0, 20.0], target: [0, 5.0, -6.0] },

      // Interior viewpoints (Phase 3)
      interiorEntrance: { pos: [0, 1.7, -12.5], target: [0, 2.8, -39.0] },
      centralAisle: { pos: [0, 1.7, -22.0], target: [0, 2.8, -39.0] },
      lookBackEntrance: { pos: [0, 1.7, -26.0], target: [0, 2.2, -6.0] },
      leftAisle: { pos: [-7.0, 1.7, -24.0], target: [0, 2.6, -39.0] },
      rightAisle: { pos: [7.0, 1.7, -24.0], target: [0, 2.6, -39.0] },
      ceilingInspection: { pos: [0, 1.7, -24.0], target: [0, 8.5, -26.0] },

      // Tableau & Pratima viewpoints (Phase 4 - grounded at interior eye height Y = 2.35m)
      tableauDarshan: { pos: [0, 2.35, -33.5], target: [0, 3.8, -39.0] },
      tableauCloser: { pos: [0, 2.35, -34.8], target: [0, 3.8, -39.0] },
      durgaFaceCloseUp: { pos: [0, 2.35, -36.2], target: [0, 4.4, -39.0] },
      armsAndWeaponsView: { pos: [0, 2.35, -35.2], target: [0, 3.8, -39.0] },
      lionAndAsuraCloseUp: { pos: [0, 2.35, -35.2], target: [0, 2.1, -38.5] },
      supportingLeftView: { pos: [-2.8, 2.35, -35.0], target: [-2.8, 2.9, -39.0] },
      supportingRightView: { pos: [2.8, 2.35, -35.0], target: [2.8, 2.9, -39.0] },
      tableauAngledView: { pos: [-4.2, 2.35, -34.0], target: [0, 3.6, -39.0] },
      pedestalContactView: { pos: [0, 2.35, -35.0], target: [0, 1.2, -39.0] },

      // Crowd inspection viewpoints (Phase 5)
      crowdPlazaApproach: { pos: [0, 1.7, 14.0], target: [0, 2.5, 0.0] },
      crowdEntranceFlow: { pos: [0, 1.7, 4.0], target: [0, 2.0, -10.0] },
      crowdInteriorAisle: { pos: [0, 1.7, -18.0], target: [0, 2.5, -39.0] },
      crowdDarshanArea: { pos: [0, 1.7, -30.0], target: [0, 3.0, -39.0] },
      crowdLeftWing: { pos: [-5.5, 1.7, -22.0], target: [-2.0, 2.0, -26.0] },
      crowdRightWing: { pos: [5.5, 1.7, -22.0], target: [2.0, 2.0, -26.0] },

      // Mela Ground viewpoints (Phase 6)
      melaToranEntrance: { pos: [0, 1.7, 40.0], target: [0, 4.0, 0.0] },
      melaFoodStallsLane: { pos: [-9.0, 1.7, 26.0], target: [-13.0, 2.0, 22.0] },
      melaCraftStallsLane: { pos: [9.0, 1.7, 26.0], target: [13.0, 2.0, 22.0] },
      melaOverlook: { pos: [0, 14.0, 48.0], target: [0, 4.0, 0.0] },
    };

    // Expose diagnostic state for QA and verification
    window.__APP__ = {
      instance: this,
      getFrameCount: () => this.frameCount,
      getRendererInfo: () => ({
        triangles: this.renderer.info.render.triangles,
        calls: this.renderer.info.render.calls,
        lines: this.renderer.info.render.lines,
        points: this.renderer.info.render.points,
      }),
      camera: this.camera,
      scene: this.scene,
      renderer: this.renderer,
      exterior: this.exterior,
      interior: this.interior,
      tableau: this.tableau,
      crowd: this.crowd,
      mela: this.mela,
      controller: this.controller,
      audio: this.audio,
      mobileControls: this.mobileControls,
      setCameraPreset: (presetName) => {
        const preset = this.cameraPresets[presetName];
        if (preset) {
          if (this.controller) {
            const dx = preset.target[0] - preset.pos[0];
            const dy = preset.target[1] - preset.pos[1];
            const dz = preset.target[2] - preset.pos[2];
            const yaw = Math.atan2(dx, -dz);
            const pitch = Math.atan2(dy, Math.hypot(dx, dz));
            this.controller.setPosition(
              preset.pos[0], preset.pos[1], preset.pos[2], yaw, pitch
            );
          } else {
            this.camera.position.set(...preset.pos);
            this.camera.lookAt(...preset.target);
          }
          return true;
        }
        return false;
      },
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.rendererManager.handleResize(width, height);
  }

  animate() {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Update First-Person Controller
    if (this.controller && this.controller.update) {
      this.controller.update(delta);
    }

    // Update Mobile Touch Controls
    if (this.mobileControls && this.mobileControls.update) {
      this.mobileControls.update();
    }

    // Update Crowd simulation
    if (this.crowd && this.crowd.update) {
      this.crowd.update(delta);
    }

    // Update Spatial Audio Soundscape
    if (this.audio && this.controller) {
      this.audio.update(this.controller.position);
    }

    // Render current frame
    this.renderer.render(this.scene, this.camera);
    this.frameCount++;
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);

    if (this.mobileControls) this.mobileControls.dispose();
    if (this.audio) this.audio.dispose();
    if (this.controller) this.controller.dispose();
    if (this.crowd) this.crowd.dispose();
    if (this.mela) this.mela.dispose();
    if (this.tableau) this.tableau.dispose();
    if (this.interior) this.interior.dispose();
    if (this.exterior) this.exterior.dispose();
    if (this.ground) this.ground.dispose();
    if (this.lighting) this.lighting.dispose();
    if (this.scene && this.scene.userData && this.scene.userData.skyTexture) {
      this.scene.userData.skyTexture.dispose();
    }
    if (this.rendererManager) this.rendererManager.dispose();
  }
}

// Initialize application and manage minimal loading screen lifecycle
async function init() {
  const loadingScreen = document.getElementById('loading-screen');
  const errorElement = document.getElementById('loading-error');
  const spinner = document.querySelector('.loading-spinner');
  const instructionsContainer = document.getElementById('loading-instructions');

  // Verify and ensure exact device controls are displayed on loading screen
  if (instructionsContainer) {
    if (isMobileDevice()) {
      instructionsContainer.innerHTML = `
        <p><strong>Virtual Joystick</strong> — Move</p>
        <p><strong>Swipe (Right Screen)</strong> — Look around</p>
      `;
    } else {
      instructionsContainer.innerHTML = `
        <p><strong>W A S D</strong> — Move</p>
        <p><strong>Mouse</strong> — Look around</p>
        <p><strong>ESC</strong> — Release mouse / exit mouse look</p>
      `;
    }
  }

  try {
    const app = new Application();
    app.start();

    // Render initial frame to compile Three.js materials and shaders
    app.renderer.render(app.scene, app.camera);

    // Wait for audio buffers to finish preloading so audio is ready immediately
    if (app.audio && app.audio.loadingPromise) {
      await Promise.race([
        app.audio.loadingPromise,
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }

    // Yield to the browser so the rendered frame is fully ready
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Ensure comfortable duration (~600ms) to clearly view the exact controls on loading screen
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Helper to dismiss loading screen
    const dismissLoadingScreen = () => {
      if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
          }
        }, 450);
      }
    };

    // 1. Loading screen finishes: dismiss loading screen after user has seen exact controls
    dismissLoadingScreen();

    const orientationLock = app.mobileControls && app.mobileControls.orientationLock;

    if (orientationLock) {
      // 2. For mobile UI: AFTER showing exact controls and loading finishes,
      // activate orientation monitoring. If in portrait, it will prompt to rotate to landscape.
      orientationLock.activate();

      // 3. Once device is confirmed in landscape mode, enable controls and audio
      orientationLock.onLandscape(() => {
        app.controller.enabled = true;
        if (app.audio) {
          app.audio.startSoundscapeOnLoad();
        }
      });
    } else {
      // Desktop: immediately enable controls and start audio
      app.controller.enabled = true;
      if (app.audio) {
        app.audio.startSoundscapeOnLoad();
      }
    }

    return app;
  } catch (err) {
    console.error('Initialization error:', err);
    if (spinner) spinner.style.display = 'none';
    if (errorElement) {
      errorElement.textContent = 'Failed to load experience: ' + err.message;
      errorElement.style.display = 'block';
    }
  }
}

const appPromise = init();
if (typeof window !== 'undefined') {
  window.appPromise = appPromise;
}
export default appPromise;


