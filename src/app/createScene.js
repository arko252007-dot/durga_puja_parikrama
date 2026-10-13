import * as THREE from 'three';
import { createFestivalSkyTexture } from '../world/FestivalSky.js';

/**
 * Creates and initializes the main 3D scene.
 * Configures an authentic Sharadotsav festival evening sky background
 * and subtle atmospheric depth fog.
 * 
 * @returns {THREE.Scene}
 */
export function createScene() {
  const scene = new THREE.Scene();

  // Authentic Kolkata autumn festival twilight sky dome
  const skyTexture = createFestivalSkyTexture();
  scene.background = skyTexture;

  // Harmonized atmospheric depth fog (begins at 38m, smoothly softens out to 135m)
  const fogColor = new THREE.Color(0x131722);
  scene.fog = new THREE.Fog(fogColor, 38, 135);

  // Store texture reference for clean disposal
  scene.userData.skyTexture = skyTexture;

  return scene;
}
