import * as THREE from 'three';

/**
 * Creates balanced scene illumination for the Grand Pandal and Mela Ground.
 * Features:
 * - Soft evening dusk hemisphere light with terracotta ground bounce.
 * - Primary directional key light covering the grand facade with soft shadows.
 * - Lateral warm fill light to reveal architectural terracotta reliefs.
 * - Subtle festival fairground fill light ensuring outdoor stalls and visitors are visible.
 * 
 * @param {THREE.Scene} scene 
 * @returns {{ keyLight: THREE.DirectionalLight, hemiLight: THREE.HemisphereLight, fillLight: THREE.DirectionalLight, melaFill: THREE.DirectionalLight, dispose: () => void }}
 */
export function createLighting(scene) {
  // Hemisphere light: atmospheric dusk sky and warm earthen festival bounce
  const hemiLight = new THREE.HemisphereLight(0x7890bf, 0x241a18, 0.72);
  hemiLight.position.set(0, 45, 0);
  scene.add(hemiLight);

  // Directional key light: simulating warm evening festival flood/searchlight illumination
  const keyLight = new THREE.DirectionalLight(0xfffaed, 1.45);
  keyLight.position.set(16, 28, 22);
  keyLight.castShadow = true;

  // Shadow camera covering the grand facade (~36m wide, ~18m tall)
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 95;
  keyLight.shadow.camera.left = -24;
  keyLight.shadow.camera.right = 24;
  keyLight.shadow.camera.top = 24;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.normalBias = 0.02;

  scene.add(keyLight);

  // Soft secondary warm fill light from the west flank to reveal terracotta relief
  const fillLight = new THREE.DirectionalLight(0xff9944, 0.38);
  fillLight.position.set(-20, 16, 15);
  scene.add(fillLight);

  // Soft directional fairground fill light for the outdoor mela ground
  const melaFill = new THREE.DirectionalLight(0xffbe88, 0.32);
  melaFill.position.set(0, 24, 45);
  melaFill.target.position.set(0, 0, 24);
  scene.add(melaFill);
  scene.add(melaFill.target);

  function dispose() {
    scene.remove(hemiLight);
    scene.remove(keyLight);
    scene.remove(fillLight);
    scene.remove(melaFill);
    scene.remove(melaFill.target);
    hemiLight.dispose();
    keyLight.dispose();
    fillLight.dispose();
    melaFill.dispose();
  }

  return {
    keyLight,
    hemiLight,
    fillLight,
    melaFill,
    dispose,
  };
}
