import * as THREE from 'three';

/**
 * Creates a calibrated temporary reference object at human scale (~1.75m height)
 * to verify perspective, depth, shadows, PBR materials, and lighting.
 * 
 * @param {THREE.Scene} scene 
 * @returns {{ group: THREE.Group, update: (delta: number) => void, dispose: () => void }}
 */
export function createReferenceObject(scene) {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // 1. Base plinth (1.0m x 0.2m x 1.0m)
  const baseGeo = new THREE.BoxGeometry(1.0, 0.2, 1.0);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x3d4454,
    roughness: 0.7,
    metalness: 0.1,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.1;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Central pillar column (height 1.2m, diameter 0.4m)
  const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 32);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xc87d55, // Warm terracotta / festive earthen tone
    roughness: 0.4,
    metalness: 0.15,
  });
  const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
  pillarMesh.position.y = 0.8;
  pillarMesh.castShadow = true;
  pillarMesh.receiveShadow = true;
  group.add(pillarMesh);

  // 3. Eye-level spherical finial (diameter 0.35m, sits at y = 1.6m, near 1.7m eye line)
  const sphereGeo = new THREE.SphereGeometry(0.18, 32, 24);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xe0a93b, // Gold brass finish to verify specular highlight & reflection
    roughness: 0.25,
    metalness: 0.8,
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.y = 1.58;
  sphereMesh.castShadow = true;
  sphereMesh.receiveShadow = true;
  group.add(sphereMesh);

  // 4. Floating indicator ring to verify depth & perspective
  const torusGeo = new THREE.TorusGeometry(0.35, 0.02, 16, 48);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x4fc3f7,
    roughness: 0.3,
    metalness: 0.5,
  });
  const torusMesh = new THREE.Mesh(torusGeo, torusMat);
  torusMesh.rotation.x = Math.PI / 2;
  torusMesh.position.y = 1.58;
  torusMesh.castShadow = true;
  group.add(torusMesh);

  scene.add(group);

  // Rotation animation updater
  function update(delta) {
    group.rotation.y += delta * 0.5;
  }

  function dispose() {
    scene.remove(group);
    baseGeo.dispose();
    baseMat.dispose();
    pillarGeo.dispose();
    pillarMat.dispose();
    sphereGeo.dispose();
    sphereMat.dispose();
    torusGeo.dispose();
    torusMat.dispose();
  }

  return {
    group,
    update,
    dispose,
  };
}
