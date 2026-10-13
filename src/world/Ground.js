import * as THREE from 'three';

/**
 * Creates the ground plane configured for human scale (1 unit = ~1 metre).
 * Receives shadows and includes a subtle scale grid.
 * 
 * @param {THREE.Scene} scene 
 * @returns {{ groundMesh: THREE.Mesh, gridHelper: THREE.GridHelper, dispose: () => void }}
 */
export function createGround(scene) {
  // Ground plane: 100m x 100m
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x141822,
    roughness: 0.88,
    metalness: 0.08,
  });

  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.05, 0);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  function dispose() {
    scene.remove(groundMesh);
    groundGeometry.dispose();
    groundMaterial.dispose();
  }

  return {
    groundMesh,
    dispose,
  };
}
