import * as THREE from 'three';
import { createStallSignTexture, createAwningStripesTexture } from './MelaTextures.js';

/**
 * 3D Festival Mela Stalls Builder:
 * Creates rich 3D stall architectures with awnings, counters, display shelving,
 * volumetric food/merchandise props, hanging lights, and decorative details.
 * Also registers AABB collision bounding boxes for the player navigation controller.
 */

export function createMelaStalls(registerGeom, registerMaterial) {
  const stallsGroup = new THREE.Group();
  stallsGroup.name = 'MelaStallsGroup';

  const colliders = [];

  function addCollider(minX, maxX, minZ, maxZ, minY = 0, maxY = 3.5) {
    colliders.push(new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    ));
  }

  // Shared wood and counter materials
  const darkTimberMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0x3d2719,
    roughness: 0.72,
    metalness: 0.04,
  }));

  const counterTopMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xd0a476,
    roughness: 0.58,
    metalness: 0.04,
  }));

  const brassKadhaiMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xd4a84e,
    roughness: 0.28,
    metalness: 0.82,
  }));

  const steelMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xe0e5ec,
    roughness: 0.22,
    metalness: 0.88,
  }));

  const warmBulbMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xfff2b8,
    emissive: 0xffb536,
    emissiveIntensity: 3.8,
    roughness: 0.15,
  }));

  // Generic 3D Stall Framework
  function buildStallStructure(config) {
    const {
      x, z, rotY,
      width = 4.2, depth = 3.0, height = 3.2,
      signText, signBgColor, signTextColor,
      awningColors,
    } = config;

    const stall = new THREE.Group();
    stall.position.set(x, 0, z);
    stall.rotation.y = rotY;

    // 1. Timber corner support posts
    const postGeo = registerGeom(new THREE.CylinderGeometry(0.08, 0.08, height, 8));
    const hx = width / 2 - 0.15;
    const hz = depth / 2 - 0.15;
    const postPositions = [
      [-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz]
    ];
    postPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, darkTimberMat);
      post.position.set(px, height / 2, pz);
      post.castShadow = true;
      stall.add(post);
    });

    // 2. Base Wooden Floor Platform
    const floorGeo = registerGeom(new THREE.BoxGeometry(width, 0.12, depth));
    const floor = new THREE.Mesh(floorGeo, darkTimberMat);
    floor.position.y = 0.06;
    stall.add(floor);

    // 3. Back Wall & Enclosure
    const backWallGeo = registerGeom(new THREE.BoxGeometry(width, 2.4, 0.1));
    const backWall = new THREE.Mesh(backWallGeo, darkTimberMat);
    backWall.position.set(0, 1.25, -hz);
    stall.add(backWall);

    // 4. Slanted Striped Canvas Awning / Canopy
    const awningTex = createAwningStripesTexture(awningColors[0], awningColors[1]);
    const awningMat = registerMaterial(new THREE.MeshStandardMaterial({
      map: awningTex,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }));

    const roofGeo = registerGeom(new THREE.BoxGeometry(width + 0.4, 0.06, depth + 0.6));
    const roof = new THREE.Mesh(roofGeo, awningMat);
    roof.position.set(0, height - 0.15, 0.1);
    roof.rotation.x = 0.12; // Slanted towards front
    roof.castShadow = true;
    stall.add(roof);

    // Awning valance frill in front
    const frillGeo = registerGeom(new THREE.BoxGeometry(width + 0.4, 0.25, 0.04));
    const frill = new THREE.Mesh(frillGeo, awningMat);
    frill.position.set(0, height - 0.35, hz + 0.35);
    stall.add(frill);

    // 5. Overhead Hanging Festival Light
    const bulb = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.12, 10, 10)), warmBulbMat);
    bulb.position.set(0, height - 0.4, 0);
    stall.add(bulb);

    // 6. Front Service Counter
    const counterGeo = registerGeom(new THREE.BoxGeometry(width - 0.2, 0.95, 0.75));
    const counter = new THREE.Mesh(counterGeo, counterTopMat);
    counter.position.set(0, 0.475, hz - 0.2);
    counter.castShadow = true;
    counter.receiveShadow = true;
    stall.add(counter);

    // 7. Overhead Signboard
    const signTex = createStallSignTexture(signText, signBgColor, signTextColor);
    const signMat = registerMaterial(new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.5,
      metalness: 0.1,
    }));
    const signGeo = registerGeom(new THREE.BoxGeometry(width - 0.4, 0.6, 0.08));
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, height - 0.05, hz + 0.3);
    stall.add(sign);

    // 8. Rear Display Shelves
    for (let s = 0; s < 3; s++) {
      const shelfGeo = registerGeom(new THREE.BoxGeometry(width - 0.6, 0.06, 0.45));
      const shelf = new THREE.Mesh(shelfGeo, counterTopMat);
      shelf.position.set(0, 1.1 + s * 0.45, -hz + 0.35);
      stall.add(shelf);
    }

    stallsGroup.add(stall);

    // Register collision box for the stall body
    const cWidth = width * 1.05;
    const cDepth = depth * 1.05;
    addCollider(x - cWidth / 2, x + cWidth / 2, z - cDepth / 2, z + cDepth / 2, 0, height);

    return { stall, counterPos: new THREE.Vector3(0, 0.95, hz - 0.2) };
  }

  // --- STALL 1: Kolkata Kathi Roll & Chaat Counter (Left Plaza: x = -13.0, z = 18.0) ---
  const rollStall = buildStallStructure({
    x: -13.0, z: 18.0, rotY: 0.25,
    width: 4.2, depth: 3.0, height: 3.2,
    signText: 'KOLKATA KATHI ROLL & CHAAT',
    signBgColor: '#8a151b', signTextColor: '#ffffff',
    awningColors: ['#b32230', '#f5efe0'],
  });
  // Props: Large Flat Tawa, Paratha rolls, spice shakers, steel bowls
  const tawa = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 16)), steelMat);
  tawa.position.set(-0.8, 0.98, 1.1);
  rollStall.stall.add(tawa);

  const oilContainer = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 10)), steelMat);
  oilContainer.position.set(-1.5, 1.12, 1.1);
  rollStall.stall.add(oilContainer);

  for (let r = 0; r < 4; r++) {
    const rollMesh = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8)), counterTopMat);
    rollMesh.rotation.z = Math.PI / 2;
    rollMesh.position.set(0.2 + r * 0.2, 0.98, 1.1);
    rollStall.stall.add(rollMesh);
  }

  // --- STALL 2: Authentic Mishti / Bengali Sweets (Left Plaza: x = -13.5, z = 24.5) ---
  const sweetStall = buildStallStructure({
    x: -13.5, z: 24.5, rotY: 0.15,
    width: 4.2, depth: 3.0, height: 3.2,
    signText: 'BENGALI MISHTI BHANDAR',
    signBgColor: '#b86214', signTextColor: '#ffffff',
    awningColors: ['#d48817', '#ffffff'],
  });
  // Props: Trays of Rosogolla, Sandesh, Chamcham
  const whiteMishtiMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xfcfbf7,
    roughness: 0.38,
    metalness: 0.02,
    emissive: 0x24221c,
    emissiveIntensity: 0.25,
  }));
  const saffronMishtiMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xf2a632,
    roughness: 0.42,
    metalness: 0.04,
    emissive: 0x382006,
    emissiveIntensity: 0.3,
  }));
  for (let t = 0; t < 3; t++) {
    const tray = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.65, 0.04, 0.4)), steelMat);
    tray.position.set(-0.9 + t * 0.9, 0.97, 1.1);
    sweetStall.stall.add(tray);

    // Mishti spheres in tray
    for (let m = 0; m < 6; m++) {
      const sweet = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.05, 8, 8)), t === 1 ? saffronMishtiMat : whiteMishtiMat);
      sweet.position.set(-1.1 + t * 0.9 + (m % 3) * 0.12, 1.02, 1.0 + Math.floor(m / 3) * 0.12);
      sweetStall.stall.add(sweet);
    }
  }

  // --- STALL 3: Fuchka / Pani Puri & Jhalmuri (Left Plaza: x = -12.5, z = 31.0) ---
  const fuchkaStall = buildStallStructure({
    x: -12.5, z: 31.0, rotY: 0.1,
    width: 4.0, depth: 2.8, height: 3.2,
    signText: 'KOLKATA SPECIAL FUCHKA',
    signBgColor: '#1e5e3a', signTextColor: '#ffffff',
    awningColors: ['#1b4d3e', '#e6c65b'],
  });
  // Large Terracotta Water Pot (Kundo) wrapped in red cloth + Crispy fuchka basket
  const potMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8a321e, roughness: 0.7 }));
  const pot = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.35, 14, 14)), potMat);
  pot.position.set(-0.8, 1.25, 1.0);
  fuchkaStall.stall.add(pot);

  const fuchkaBox = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.8, 0.45, 0.4)), counterTopMat);
  fuchkaBox.position.set(0.6, 1.15, 1.0);
  fuchkaStall.stall.add(fuchkaBox);

  // --- STALL 4: Traditional Bengali Handicrafts & Clay Dolls (Right Plaza: x = 13.0, z = 18.0) ---
  const handicraftStall = buildStallStructure({
    x: 13.0, z: 18.0, rotY: -0.25,
    width: 4.2, depth: 3.0, height: 3.2,
    signText: 'BENGAL HANDICRAFT & DOKRA',
    signBgColor: '#6e2b1d', signTextColor: '#ffffff',
    awningColors: ['#8c2d19', '#ded2ba'],
  });
  // Props: Terracotta Bankura Horses, painted clay pots
  for (let h = 0; h < 3; h++) {
    const horse = new THREE.Group();
    horse.position.set(-0.8 + h * 0.8, 0.97, 1.1);
    const hBody = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8)), potMat);
    hBody.position.y = 0.2;
    horse.add(hBody);
    const hEars = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.04, 0.2, 6)), potMat);
    hEars.position.set(0, 0.42, 0);
    horse.add(hEars);
    handicraftStall.stall.add(horse);
  }

  // --- STALL 5: Shakh-Pola & Glass Bangles / Jewellery (Right Plaza: x = 13.5, z = 24.5) ---
  const bangleStall = buildStallStructure({
    x: 13.5, z: 24.5, rotY: -0.15,
    width: 4.2, depth: 3.0, height: 3.2,
    signText: 'SHAKHA POLA & JEWELLERY',
    signBgColor: '#9e1b4b', signTextColor: '#ffffff',
    awningColors: ['#a81d4a', '#ffffff'],
  });
  // Props: Cylindrical display stands with concentric red/gold/white bangles
  const redBangleMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0xcc1122, roughness: 0.3, metalness: 0.2 }));
  const goldBangleMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0xdfb136, roughness: 0.2, metalness: 0.8 }));
  for (let s = 0; s < 4; s++) {
    const stand = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12)), darkTimberMat);
    stand.position.set(-1.1 + s * 0.7, 1.15, 1.1);
    bangleStall.stall.add(stand);

    const bRing = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.12, 0.02, 8, 16)), s % 2 === 0 ? redBangleMat : goldBangleMat);
    bRing.rotation.x = Math.PI / 2;
    bRing.position.set(-1.1 + s * 0.7, 1.25, 1.1);
    bangleStall.stall.add(bRing);
  }

  // --- STALL 6: Festival Toy & Puppet Shop (Right Plaza: x = 12.5, z = 31.0) ---
  const toyStall = buildStallStructure({
    x: 12.5, z: 31.0, rotY: -0.1,
    width: 4.0, depth: 2.8, height: 3.2,
    signText: 'MELA TOYS & PUZZLES',
    signBgColor: '#1d427d', signTextColor: '#ffffff',
    awningColors: ['#1f3864', '#e8b86d'],
  });
  // Colorful blocks and pinwheels
  const brightMats = [
    registerMaterial(new THREE.MeshStandardMaterial({ color: 0xe62a35 })),
    registerMaterial(new THREE.MeshStandardMaterial({ color: 0x228be6 })),
    registerMaterial(new THREE.MeshStandardMaterial({ color: 0x40c057 })),
    registerMaterial(new THREE.MeshStandardMaterial({ color: 0xfcc419 })),
  ];
  for (let b = 0; b < 6; b++) {
    const block = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.16, 0.16, 0.16)), brightMats[b % 4]);
    block.position.set(-0.9 + (b % 3) * 0.3, 1.05 + Math.floor(b / 3) * 0.18, 1.1);
    toyStall.stall.add(block);
  }

  // --- STALL 7: Hot Chai & Pakoda / Telebhaja Stand (Rear Promenade: x = -6.0, z = 38.0) ---
  const chaiStall = buildStallStructure({
    x: -6.0, z: 38.0, rotY: Math.PI,
    width: 3.8, depth: 2.6, height: 3.0,
    signText: 'GARAM CHAI & TELEBHAJA',
    signBgColor: '#5c3116', signTextColor: '#ffffff',
    awningColors: ['#8a4b27', '#f0e3cc'],
  });
  // Brass samovar & earthen cups (Kullad / Bhar)
  const samovar = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.25, 0.2, 0.65, 12)), brassKadhaiMat);
  samovar.position.set(-0.6, 1.25, 0.9);
  chaiStall.stall.add(samovar);

  // Earthen Kullad cups stacked
  for (let k = 0; k < 5; k++) {
    const bhar = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.045, 0.03, 0.08, 8)), potMat);
    bhar.position.set(0.4 + (k % 3) * 0.12, 0.98, 0.8 + Math.floor(k / 3) * 0.12);
    chaiStall.stall.add(bhar);
  }

  // --- STALL 8: Balloons & Ring Toss Game Stall (Rear Promenade: x = 6.0, z = 38.0) ---
  const gameStall = buildStallStructure({
    x: 6.0, z: 38.0, rotY: Math.PI,
    width: 3.8, depth: 2.6, height: 3.0,
    signText: 'BALLOON SHOOT & GAMES',
    signBgColor: '#0c6158', signTextColor: '#ffffff',
    awningColors: ['#0f766e', '#fef08a'],
  });
  // Dartboard targets on back wall
  for (let r = 0; r < 3; r++) {
    const target = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 16)), brightMats[r]);
    target.rotation.x = Math.PI / 2;
    target.position.set(-0.8 + r * 0.8, 2.0, -1.1);
    gameStall.stall.add(target);
  }

  return {
    group: stallsGroup,
    colliders,
  };
}
