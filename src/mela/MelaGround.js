import * as THREE from 'three';
import { createMelaPathwayTexture } from './MelaTextures.js';
import { createMelaStalls } from './MelaStalls.js';

/**
 * Creates the complete explorable Durga Puja Mela Ground:
 * - Continuous 120m x 120m festival fairground ground plane.
 * - Central approach promenade leading to the Bishnupur pandal.
 * - 8 distinct 3D food and handicraft stalls along walking lanes.
 * - Overhead festive bunting, strings of lights, banners, and lamp posts.
 * - Balloon vendors with floating colorful balloon bunches.
 * - Surrounding festival fencing, queue barriers, and decorative mela gate.
 * - Comprehensive collision AABB registry for the First-Person Controller.
 */

export function createMelaGround(scene) {
  const group = new THREE.Group();
  group.name = 'CompleteMelaGround';

  const disposables = [];
  function registerGeom(geo) {
    disposables.push(geo);
    return geo;
  }
  function registerMaterial(mat) {
    disposables.push(mat);
    return mat;
  }

  // Master collection of collision boxes for first-person exploration
  const colliders = [];

  function addAABB(minX, maxX, minZ, maxZ, minY = 0, maxY = 5.0) {
    colliders.push(new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    ));
  }

  // --- 1. CONTINUOUS EXPANDED FAIRGROUND GROUND SURFACE ---
  const pathwayTex = createMelaPathwayTexture();
  pathwayTex.repeat.set(12, 12);
  disposables.push(pathwayTex);

  const groundMat = registerMaterial(new THREE.MeshStandardMaterial({
    map: pathwayTex,
    color: 0x3a3028,
    roughness: 0.9,
    metalness: 0.05,
  }));

  // 120m x 120m ground plane centered on the festival precinct (Z = 0)
  const groundGeo = registerGeom(new THREE.PlaneGeometry(120, 120));
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.01, 5); // Flush with Y = 0
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // Central Grand Approach Walkway / Plaza (10m wide x 40m long)
  const walkwayMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0x2e231c,
    roughness: 0.82,
    metalness: 0.08,
  }));
  const walkwayGeo = registerGeom(new THREE.BoxGeometry(10, 0.02, 42));
  const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
  walkway.position.set(0, 0.01, 22);
  walkway.receiveShadow = true;
  group.add(walkway);

  // --- 2. THE 8 FESTIVAL MELA STALLS ---
  const stalls = createMelaStalls(registerGeom, registerMaterial);
  group.add(stalls.group);
  stalls.colliders.forEach((box) => colliders.push(box));

  // --- 3. OVERHEAD FESTIVE BUNTING & STRING LIGHTS ---
  const stringMat = registerMaterial(new THREE.LineBasicMaterial({ color: 0x332211 }));
  const lightColors = [0xffdd66, 0xff5533, 0x44dd66, 0x33aaff, 0xff88dd];
  const flagColors = [0xdf2935, 0x3b82f6, 0xeab308, 0x10b981, 0xec4899];

  // String lights crossing between left and right stall rows
  const lightSpans = [
    { z: 18.0, x1: -11.0, x2: 11.0, y1: 3.2, y2: 3.2 },
    { z: 25.0, x1: -11.5, x2: 11.5, y1: 3.2, y2: 3.2 },
    { z: 32.0, x1: -10.5, x2: 10.5, y1: 3.2, y2: 3.2 },
    { z: 38.0, x1: -8.0, x2: 8.0, y1: 3.2, y2: 3.2 },
  ];

  lightSpans.forEach((span, sIdx) => {
    // Sagging catenary curve
    const points = [];
    const bulbCount = 14;
    for (let i = 0; i <= bulbCount; i++) {
      const t = i / bulbCount;
      const x = THREE.MathUtils.lerp(span.x1, span.x2, t);
      // Parabolic catenary sag (0.5m sag in middle)
      const sag = 4 * 0.5 * t * (1 - t);
      const y = span.y1 - sag;
      points.push(new THREE.Vector3(x, y, span.z));

      // Hanging bulb
      if (i > 0 && i < bulbCount && i % 2 === 0) {
        const bulbMat = registerMaterial(new THREE.MeshStandardMaterial({
          color: lightColors[(sIdx * 3 + i) % lightColors.length],
          emissive: lightColors[(sIdx * 3 + i) % lightColors.length],
          emissiveIntensity: 2.5,
          roughness: 0.2,
        }));
        const bulb = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.08, 8, 8)), bulbMat);
        bulb.position.set(x, y - 0.08, span.z);
        group.add(bulb);
      }

      // Triangular festive paper flag (Bunting / Festoons)
      if (i > 0 && i < bulbCount && i % 2 === 1) {
        const flagMat = registerMaterial(new THREE.MeshStandardMaterial({
          color: flagColors[(sIdx * 2 + i) % flagColors.length],
          roughness: 0.6,
          side: THREE.DoubleSide,
        }));
        const flagGeo = registerGeom(new THREE.ConeGeometry(0.12, 0.24, 3));
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.rotation.x = Math.PI;
        flag.position.set(x, y - 0.14, span.z);
        group.add(flag);
      }
    }

    const curveGeo = registerGeom(new THREE.BufferGeometry().setFromPoints(points));
    const line = new THREE.Line(curveGeo, stringMat);
    group.add(line);
  });

  // --- 4. BALLOON SELLERS (Colourful floating balloon bundles) ---
  function createBalloonVendor(x, z) {
    const vGroup = new THREE.Group();
    vGroup.position.set(x, 0, z);

    // Vendor's bamboo staff
    const staffMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0xb58e58, roughness: 0.8 }));
    const staff = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.03, 0.03, 2.8, 8)), staffMat);
    staff.position.y = 1.4;
    vGroup.add(staff);

    // Cluster of ~12 colorful balloons
    const balloonPalette = [0xff2a40, 0x228be6, 0xffd43b, 0x40c057, 0xf06595, 0x845ef7];
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2;
      const bRad = 0.25 + (b % 3) * 0.12;
      const bY = 2.4 + (b % 4) * 0.18;

      const bMat = registerMaterial(new THREE.MeshStandardMaterial({
        color: balloonPalette[b % balloonPalette.length],
        roughness: 0.25,
        metalness: 0.1,
      }));
      const bMesh = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.12, 10, 10)), bMat);
      bMesh.scale.set(1.0, 1.25, 1.0);
      bMesh.position.set(Math.cos(angle) * bRad, bY, Math.sin(angle) * bRad);
      vGroup.add(bMesh);

      // String tethering balloon to pole
      const stringPts = [
        new THREE.Vector3(0, 1.8, 0),
        new THREE.Vector3(Math.cos(angle) * bRad, bY - 0.12, Math.sin(angle) * bRad)
      ];
      const sGeo = registerGeom(new THREE.BufferGeometry().setFromPoints(stringPts));
      const sLine = new THREE.Line(sGeo, stringMat);
      vGroup.add(sLine);
    }

    group.add(vGroup);
    addAABB(x - 0.5, x + 0.5, z - 0.5, z + 0.5, 0, 3.0);
  }

  createBalloonVendor(-4.5, 16.0);
  createBalloonVendor(5.2, 28.0);

  // --- 5. FESTIVAL QUEUE BARRIERS & MELA PERIMETER FENCING ---
  const barrierMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0x8c2d19, // Festival crimson painted wood
    roughness: 0.7,
  }));

  // Approach queue barricades guiding traffic (X = -2.8 and X = 2.8, Z = 5.0 to 14.0)
  for (const bx of [-2.8, 2.8]) {
    for (let bz = 5.0; bz <= 13.0; bz += 2.5) {
      const post = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8)), barrierMat);
      post.position.set(bx, 0.55, bz);
      group.add(post);
    }
    const rail = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.08, 0.1, 8.5)), barrierMat);
    rail.position.set(bx, 0.8, 9.0);
    group.add(rail);

    addAABB(bx - 0.25, bx + 0.25, 4.5, 13.5, 0, 1.2);
  }

  // --- 6. WOODEN FESTIVAL BENCHES (Resting areas) ---
  const benchMat = registerMaterial(new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.8 }));
  function createBench(x, z, rotY = 0) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);
    bGroup.rotation.y = rotY;

    const seat = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.8, 0.08, 0.5)), benchMat);
    seat.position.y = 0.45;
    bGroup.add(seat);

    for (const lx of [-0.75, 0.75]) {
      const leg = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.1, 0.45, 0.45)), benchMat);
      leg.position.set(lx, 0.225, 0);
      bGroup.add(leg);
    }
    group.add(bGroup);
    addAABB(x - 1.0, x + 1.0, z - 0.5, z + 0.5, 0, 0.8);
  }

  createBench(-9.0, 14.0, 0.3);
  createBench(9.0, 14.0, -0.3);
  createBench(-8.0, 34.0, 0.1);
  createBench(8.0, 34.0, -0.1);

  // --- 7. MELA ENTRANCE ARCHWAY / TORAN (Z = 42.0) ---
  const toranGroup = new THREE.Group();
  toranGroup.position.set(0, 0, 42.0);

  const toranPillarMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xded2ba,
    roughness: 0.6,
  }));
  const toranGoldMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.8,
  }));

  // Twin entrance gateway pillars (8m apart, height 6.5m)
  for (const side of [-4.5, 4.5]) {
    const pMesh = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.2, 6.5, 1.2)), toranPillarMat);
    pMesh.position.set(side, 3.25, 0);
    pMesh.castShadow = true;
    toranGroup.add(pMesh);

    const finial = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.5, 1.0, 12)), toranGoldMat);
    finial.position.set(side, 7.0, 0);
    toranGroup.add(finial);

    addAABB(side - 0.8, side + 0.8, 41.2, 42.8, 0, 7.0);
  }

  // Toran Overhead Crossbeam & Welcome Sign
  const tBeam = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(10.5, 0.8, 0.8)), toranPillarMat);
  tBeam.position.set(0, 6.0, 0);
  toranGroup.add(tBeam);

  // Welcome Sign
  const welcomeSignGeo = registerGeom(new THREE.BoxGeometry(7.5, 1.1, 0.1));
  const welcomeSignMat = registerMaterial(new THREE.MeshStandardMaterial({
    color: 0x8a151b,
    roughness: 0.5,
  }));
  const welcomeSign = new THREE.Mesh(welcomeSignGeo, welcomeSignMat);
  welcomeSign.position.set(0, 5.2, 0.45);
  group.add(toranGroup);

  // --- 7b. FESTIVAL GROUND WARM ILLUMINATION POOLS ---
  // Toran Entrance Gateway Lantern Warm Glow
  const toranLight = new THREE.PointLight(0xffba66, 2.2, 16, 1.8);
  toranLight.position.set(0, 4.8, 41.5);
  group.add(toranLight);
  disposables.push(toranLight);

  // Central Approach Promenade Midpoint Pool
  const promenadeMidLight = new THREE.PointLight(0xffbe77, 1.8, 18, 1.6);
  promenadeMidLight.position.set(0, 3.8, 28.0);
  group.add(promenadeMidLight);
  disposables.push(promenadeMidLight);

  // Food Stalls Avenue Warm Wash (illuminating Kathi Roll, Mishti, Fuchka, Chai)
  const foodAvenueLight = new THREE.PointLight(0xffa844, 2.0, 18, 1.6);
  foodAvenueLight.position.set(-10.5, 3.2, 25.0);
  group.add(foodAvenueLight);
  disposables.push(foodAvenueLight);

  // Craft Stalls Avenue Warm Wash (illuminating Dokra, Bangles, Toys, Games)
  const craftAvenueLight = new THREE.PointLight(0xffa844, 2.0, 18, 1.6);
  craftAvenueLight.position.set(10.5, 3.2, 25.0);
  group.add(craftAvenueLight);
  disposables.push(craftAvenueLight);

  // --- 8. OUTDOOR PERIMETER BOUNDARY BARRIERS ---
  // North boundary (Z = -46 behind pandal):
  addAABB(-30, 30, -47.0, -45.0, 0, 12.0);
  // West boundary (X = -28):
  addAABB(-30.0, -27.0, -46, 45, 0, 8.0);
  // East boundary (X = 28):
  addAABB(27.0, 30.0, -46, 45, 0, 8.0);
  // South boundary (Z = 45 behind mela toran):
  addAABB(-30, 30, 44.0, 47.0, 0, 8.0);

  // --- 9. ARCHITECTURAL COLLIDERS (PANDAL EXTERIOR & INTERIOR) ---
  // Pandal exterior facade walls (Z = -6.0 to -6.5, X = -18 to -3.3 and X = 3.3 to 18)
  addAABB(-18.5, -3.2, -6.8, -5.8, 0, 16.0);
  addAABB(3.2, 18.5, -6.8, -5.8, 0, 16.0);

  // Interior side walls (X = -11.0 to -10.0 and X = 10.0 to 11.0, Z = -13 to -43)
  addAABB(-12.0, -10.0, -43.0, -12.5, 0, 10.0);
  addAABB(10.0, 12.0, -43.0, -12.5, 0, 10.0);

  // Interior Sanctum Backdrop Wall (Z = -42.2 to -41.2, X = -6.0 to 6.0)
  addAABB(-6.5, 6.5, -42.5, -41.0, 0, 8.0);

  // Altar Platform Dais Perimeter (prevent stepping through the idol base; Z = -39.0 to -35.5, X = -5.5 to 5.5)
  addAABB(-5.5, 5.5, -40.5, -35.2, 0, 2.5);

  // Nave Columns (prevent walking into the 8 grand interior columns at X = ±4.2, Z = [-18, -24, -30, -35.5])
  const colZs = [-18.0, -24.0, -30.0, -35.5];
  colZs.forEach((cz) => {
    addAABB(-4.8, -3.6, cz - 0.6, cz + 0.6, 0, 7.5);
    addAABB(3.6, 4.8, cz - 0.6, cz + 0.6, 0, 7.5);
  });

  scene.add(group);

  return {
    group,
    colliders,
    dispose: () => {
      scene.remove(group);
      disposables.forEach((d) => d.dispose && d.dispose());
    },
  };
}
