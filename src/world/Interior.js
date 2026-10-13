import * as THREE from 'three';
import {
  createTerracottaPanelTexture,
  createOrnamentalBorderTexture,
  createAlponaRunnerTexture,
  createPavingTexture,
} from './ExteriorTextures.js';

/**
 * Creates the Grand Kolkata-style Durga Puja Pandal Interior Architecture.
 * 
 * Directly connects to the exterior entrance tunnel at Z = -13.0.
 * Hall footprint: 22m wide x 30m long x 9.5m ceiling height.
 * Features central nave aisle, colonnades, coffered/draped ceiling,
 * rhythmic wall bays, warm festival lighting, and a dedicated sanctum platform for Phase 4.
 * 
 * @param {THREE.Scene} scene 
 * @returns {{ group: THREE.Group, shrineBounds: object, dispose: () => void }}
 */
export function createInterior(scene) {
  const group = new THREE.Group();
  group.name = 'PandalInterior';

  // --- 1. SHARED PROCEDURAL TEXTURES & MATERIALS ---
  const terracottaTex = createTerracottaPanelTexture();
  const borderTex = createOrnamentalBorderTexture();
  borderTex.repeat.set(3, 1);
  const runnerTex = createAlponaRunnerTexture();
  runnerTex.repeat.set(1, 6);
  const pavingTex = createPavingTexture();
  pavingTex.repeat.set(6, 8);

  // Material palette matching exterior theme
  const terracottaMat = new THREE.MeshStandardMaterial({
    map: terracottaTex,
    color: 0xa84528,
    roughness: 0.65,
    metalness: 0.08,
  });

  const plainTerracottaMat = new THREE.MeshStandardMaterial({
    color: 0x8e351d,
    roughness: 0.7,
    metalness: 0.05,
  });

  const sandstoneIvoryMat = new THREE.MeshStandardMaterial({
    color: 0xded2ba,
    roughness: 0.55,
    metalness: 0.05,
  });

  const borderFriezeMat = new THREE.MeshStandardMaterial({
    map: borderTex,
    roughness: 0.45,
    metalness: 0.15,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.8,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x332018,
    roughness: 0.65,
    metalness: 0.1,
  });

  const crimsonCanopyMat = new THREE.MeshStandardMaterial({
    color: 0x821622,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const goldCanopyMat = new THREE.MeshStandardMaterial({
    color: 0xc89d32,
    roughness: 0.75,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });

  const carpetMat = new THREE.MeshStandardMaterial({
    map: runnerTex,
    roughness: 0.85,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });

  const floorMat = new THREE.MeshStandardMaterial({
    map: pavingTex,
    roughness: 0.75,
    metalness: 0.1,
  });

  const bulbEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xffe6a3,
    emissive: 0xffb03a,
    emissiveIntensity: 3.5,
    roughness: 0.2,
  });

  const chandelierGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c2,
    emissive: 0xffaa2b,
    emissiveIntensity: 4.0,
    roughness: 0.15,
  });

  const disposables = [
    terracottaTex,
    borderTex,
    runnerTex,
    pavingTex,
    terracottaMat,
    plainTerracottaMat,
    sandstoneIvoryMat,
    borderFriezeMat,
    goldTrimMat,
    darkWoodMat,
    crimsonCanopyMat,
    goldCanopyMat,
    carpetMat,
    floorMat,
    bulbEmissiveMat,
    chandelierGlowMat,
  ];

  function registerGeom(geo) {
    disposables.push(geo);
    return geo;
  }

  // --- 2. HALL DIMENSIONS & COORDINATES ---
  // Entrance tunnel ends at Z = -13.0, floor is at y = 0.65 (top surface y = 0.70)
  const tunnelStartZ = -13.0;
  const hallLength = 30.0;
  const hallEndZ = tunnelStartZ - hallLength; // Z = -43.0
  const hallCenterZ = (tunnelStartZ + hallEndZ) / 2; // Z = -28.0
  const hallWidth = 22.0;
  const floorY = 0.65; // Matches tunnel floor
  const ceilingY = 9.2; // Soaring 9.2m interior height

  // --- 3. CONTINUOUS INTERIOR FLOOR & AISLE RUNNER ---
  // A. Main interior hall floor slab (22m wide x 30m long)
  const floorGeo = registerGeom(new THREE.BoxGeometry(hallWidth, 0.1, hallLength));
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, floorY, hallCenterZ);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // B. Seamless central aisle carpet runner (4.8m wide, from Z = -13.0 to Z = -35.5)
  // Stops right at the base of the sanctum platform steps
  const runnerLength = 22.5;
  const runnerGeo = registerGeom(new THREE.PlaneGeometry(4.8, runnerLength));
  const runnerMesh = new THREE.Mesh(runnerGeo, carpetMat);
  runnerMesh.rotation.x = -Math.PI / 2;
  runnerMesh.position.set(0, 0.732, tunnelStartZ - runnerLength / 2);
  runnerMesh.receiveShadow = true;
  group.add(runnerMesh);

  // --- 4. VESTIBULE CONNECTION WALLS (Connecting tunnel at Z = -13 to hall) ---
  // The tunnel aperture is 6.6m wide (x = -3.3 to +3.3).
  // The hall is 22m wide (x = -11.0 to +11.0).
  // Connect left transition from x = -3.3 to -11.0, and right from x = +3.3 to +11.0 at Z = -13.0.
  const vestibuleWidth = (hallWidth - 6.6) / 2; // 7.7m each side
  const vestibuleGeo = registerGeom(new THREE.BoxGeometry(vestibuleWidth, ceilingY - floorY, 0.6));

  const leftVestibule = new THREE.Mesh(vestibuleGeo, plainTerracottaMat);
  leftVestibule.position.set(-hallWidth / 2 + vestibuleWidth / 2, floorY + (ceilingY - floorY) / 2, tunnelStartZ);
  leftVestibule.castShadow = true;
  leftVestibule.receiveShadow = true;
  group.add(leftVestibule);

  const rightVestibule = new THREE.Mesh(vestibuleGeo, plainTerracottaMat);
  rightVestibule.position.set(hallWidth / 2 - vestibuleWidth / 2, floorY + (ceilingY - floorY) / 2, tunnelStartZ);
  rightVestibule.castShadow = true;
  rightVestibule.receiveShadow = true;
  group.add(rightVestibule);

  // Decorative border trim on entrance inner portal arch
  const portalArchGeo = registerGeom(new THREE.BoxGeometry(7.4, 0.5, 0.8));
  const portalArch = new THREE.Mesh(portalArchGeo, borderFriezeMat);
  portalArch.position.set(0, 6.7, tunnelStartZ - 0.2);
  portalArch.castShadow = true;
  group.add(portalArch);

  // --- 5. SUPPORTING INTERIOR COLUMNS & ARCHED COLONNADES ---
  // 4 pairs of grand columns lining the central nave aisle at x = -4.2 and x = +4.2
  // Z positions: -18.0, -24.0, -30.0, -36.0
  const colZPositions = [-18.0, -24.0, -30.0, -35.5];

  function createInteriorColumn(xPos, zPos) {
    const colGroup = new THREE.Group();
    colGroup.position.set(xPos, floorY + 0.05, zPos);

    // Stepped square plinth base
    const p1 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.4, 0.4, 1.4)), sandstoneIvoryMat);
    p1.position.y = 0.2;
    p1.castShadow = true;
    p1.receiveShadow = true;
    colGroup.add(p1);

    const p2 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.1, 0.3, 1.1)), borderFriezeMat);
    p2.position.y = 0.55;
    p2.castShadow = true;
    colGroup.add(p2);

    // Fluted column shaft (height 6.5m, diameter 0.65m)
    const shaftGeo = registerGeom(new THREE.CylinderGeometry(0.32, 0.35, 6.4, 24));
    const shaft = new THREE.Mesh(shaftGeo, terracottaMat);
    shaft.position.y = 3.9;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    colGroup.add(shaft);

    // Gold decorative torus rings
    for (const ry of [2.0, 4.0, 6.0]) {
      const ring = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.36, 0.04, 12, 24)), goldTrimMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = ry;
      ring.castShadow = true;
      colGroup.add(ring);
    }

    // Capital & bracket beam block
    const cap1 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.2, 0.4, 1.2)), borderFriezeMat);
    cap1.position.y = 7.3;
    cap1.castShadow = true;
    colGroup.add(cap1);

    const cap2 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.5, 0.3, 1.5)), goldTrimMat);
    cap2.position.y = 7.65;
    cap2.castShadow = true;
    colGroup.add(cap2);

    return colGroup;
  }

  colZPositions.forEach((zPos) => {
    group.add(createInteriorColumn(-4.2, zPos));
    group.add(createInteriorColumn(4.2, zPos));

    // Transverse structural arch beam spanning between left and right column
    const archBeamGeo = registerGeom(new THREE.BoxGeometry(8.4, 0.5, 0.6));
    const archBeam = new THREE.Mesh(archBeamGeo, borderFriezeMat);
    archBeam.position.set(0, floorY + 7.7, zPos);
    archBeam.castShadow = true;
    group.add(archBeam);

    // Gold cornice trim on arch beam
    const goldBeamGeo = registerGeom(new THREE.BoxGeometry(8.6, 0.15, 0.7));
    const goldBeam = new THREE.Mesh(goldBeamGeo, goldTrimMat);
    goldBeam.position.set(0, floorY + 8.0, zPos);
    goldBeam.castShadow = true;
    group.add(goldBeam);

    // Multi-foil decorative timber arch beneath the transverse beam
    const innerArchWidth = 7.0;
    const archSegments = 12;
    for (let a = 0; a <= archSegments; a++) {
      const angle = (a / archSegments) * Math.PI;
      const ax = Math.cos(angle) * (innerArchWidth / 2);
      const ay = Math.sin(angle) * 1.4 + (floorY + 6.3);
      const bBlock = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.55, 0.25, 0.5)), goldTrimMat);
      bBlock.position.set(ax, ay, zPos);
      bBlock.rotation.z = angle - Math.PI / 2;
      bBlock.castShadow = true;
      group.add(bBlock);
    }
  });

  // Longitudinal connecting beams running parallel to aisle above colonnades
  const longBeamGeo = registerGeom(new THREE.BoxGeometry(0.6, 0.5, hallLength));
  const leftLongBeam = new THREE.Mesh(longBeamGeo, darkWoodMat);
  leftLongBeam.position.set(-4.2, floorY + 7.7, hallCenterZ);
  leftLongBeam.castShadow = true;
  group.add(leftLongBeam);

  const rightLongBeam = new THREE.Mesh(longBeamGeo, darkWoodMat);
  rightLongBeam.position.set(4.2, floorY + 7.7, hallCenterZ);
  rightLongBeam.castShadow = true;
  group.add(rightLongBeam);

  // --- 6. CEILING & SUSPENDED FESTIVAL CANOPY STRUCTURE ---
  // Main upper ceiling enclosing roof plane (22m wide x 30m long at y = 9.2m)
  const ceilingGeo = registerGeom(new THREE.BoxGeometry(hallWidth + 0.4, 0.4, hallLength + 0.4));
  const ceilingMesh = new THREE.Mesh(ceilingGeo, darkWoodMat);
  ceilingMesh.position.set(0, ceilingY, hallCenterZ);
  ceilingMesh.castShadow = true;
  group.add(ceilingMesh);

  // Traditional Bengali Pandal fabric ceiling drapes (alternating crimson and gold canopy bays)
  const canopyBays = 5;
  const bayDepth = hallLength / canopyBays;
  for (let c = 0; c < canopyBays; c++) {
    const bayZ = tunnelStartZ - (c + 0.5) * bayDepth;
    const isGold = c % 2 === 1;
    const canopyMat = isGold ? goldCanopyMat : crimsonCanopyMat;

    // Central nave vaulted fabric panel (slight catenary curvature or angled facet)
    const navePanelGeo = registerGeom(new THREE.PlaneGeometry(8.2, bayDepth - 0.4));
    const navePanel = new THREE.Mesh(navePanelGeo, canopyMat);
    navePanel.rotation.x = Math.PI / 2;
    navePanel.position.set(0, ceilingY - 0.2, bayZ);
    group.add(navePanel);

    // Left and right flank aisle ceiling panels
    const flankPanelGeo = registerGeom(new THREE.PlaneGeometry(6.6, bayDepth - 0.4));
    const leftFlankPanel = new THREE.Mesh(flankPanelGeo, isGold ? crimsonCanopyMat : goldCanopyMat);
    leftFlankPanel.rotation.x = Math.PI / 2;
    leftFlankPanel.position.set(-7.5, ceilingY - 0.4, bayZ);
    group.add(leftFlankPanel);

    const rightFlankPanel = new THREE.Mesh(flankPanelGeo, isGold ? crimsonCanopyMat : goldCanopyMat);
    rightFlankPanel.rotation.x = Math.PI / 2;
    rightFlankPanel.position.set(7.5, ceilingY - 0.4, bayZ);
    group.add(rightFlankPanel);
  }

  // --- 7. DECORATED SIDE WALLS & ARCHITECTURAL BAYS ---
  // Left wall at x = -11.0, Right wall at x = +11.0, length 30m, height 8.5m
  function createSideWall(isLeft) {
    const wallGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    const wallX = sign * (hallWidth / 2);

    // Structural wall backing
    const sWallGeo = registerGeom(new THREE.BoxGeometry(0.8, ceilingY - floorY, hallLength));
    const sWall = new THREE.Mesh(sWallGeo, plainTerracottaMat);
    sWall.position.set(wallX, floorY + (ceilingY - floorY) / 2, hallCenterZ);
    sWall.castShadow = true;
    sWall.receiveShadow = true;
    wallGroup.add(sWall);

    // 5 Architectural wall bays per side
    const bays = 5;
    const baySpacing = hallLength / bays;
    for (let b = 0; b < bays; b++) {
      const bayZ = tunnelStartZ - (b + 0.5) * baySpacing;

      // Recessed molded panel frame
      const frameGeo = registerGeom(new THREE.BoxGeometry(0.2, 4.8, 4.4));
      const frame = new THREE.Mesh(frameGeo, sandstoneIvoryMat);
      frame.position.set(wallX - sign * 0.35, floorY + 3.4, bayZ);
      frame.castShadow = true;
      wallGroup.add(frame);

      // Terracotta relief plaque inside the frame
      const panelGeo = registerGeom(new THREE.BoxGeometry(0.15, 4.2, 3.8));
      const panel = new THREE.Mesh(panelGeo, terracottaMat);
      panel.position.set(wallX - sign * 0.42, floorY + 3.4, bayZ);
      panel.castShadow = true;
      panel.receiveShadow = true;
      wallGroup.add(panel);

      // Gold arched pediment crown above the bay
      const archCrownGeo = registerGeom(new THREE.CylinderGeometry(1.6, 1.6, 0.25, 16, 1, false, 0, Math.PI));
      const archCrown = new THREE.Mesh(archCrownGeo, goldTrimMat);
      archCrown.rotation.z = Math.PI / 2;
      archCrown.rotation.x = isLeft ? Math.PI / 2 : -Math.PI / 2;
      archCrown.position.set(wallX - sign * 0.35, floorY + 5.9, bayZ);
      archCrown.castShadow = true;
      wallGroup.add(archCrown);

      // Flanking wall pilasters
      const pilasterGeo = registerGeom(new THREE.BoxGeometry(0.4, ceilingY - floorY - 0.5, 0.6));
      const pilaster = new THREE.Mesh(pilasterGeo, sandstoneIvoryMat);
      pilaster.position.set(wallX - sign * 0.3, floorY + (ceilingY - floorY) / 2, bayZ - baySpacing / 2);
      pilaster.castShadow = true;
      wallGroup.add(pilaster);

      // Warm decorative wall sconce fixture
      const sconceGeo = registerGeom(new THREE.CylinderGeometry(0.15, 0.1, 0.4, 8));
      const sconce = new THREE.Mesh(sconceGeo, goldTrimMat);
      sconce.position.set(wallX - sign * 0.55, floorY + 3.8, bayZ);
      wallGroup.add(sconce);

      const bulbGeo = registerGeom(new THREE.SphereGeometry(0.12, 12, 12));
      const bulb = new THREE.Mesh(bulbGeo, bulbEmissiveMat);
      bulb.position.set(wallX - sign * 0.55, floorY + 4.1, bayZ);
      wallGroup.add(bulb);

      // Subtle wall wash point light
      const sLight = new THREE.PointLight(0xffaa44, 1.4, 8, 2);
      sLight.position.set(wallX - sign * 0.8, floorY + 4.1, bayZ);
      wallGroup.add(sLight);
    }

    // Upper continuous cornice frieze running entire wall length
    const corniceGeo = registerGeom(new THREE.BoxGeometry(0.5, 0.6, hallLength));
    const cornice = new THREE.Mesh(corniceGeo, borderFriezeMat);
    cornice.position.set(wallX - sign * 0.3, floorY + 7.8, hallCenterZ);
    cornice.castShadow = true;
    wallGroup.add(cornice);

    return wallGroup;
  }

  group.add(createSideWall(true));
  group.add(createSideWall(false));

  // --- 8. SANCTUM PLATFORM & SHRINE DISPLAY BACKDROP (PHASE 4 FOCAL AREA) ---
  // Positioned at the far end of the hall, centered at x = 0, Z = -39.0
  const sanctumZ = -39.0;
  const platformWidth = 12.0;
  const platformDepth = 6.0;
  const platformElevation = 0.8; // 0.8m elevation above the hall floor

  // A. Elevated 3-tier sanctum display platform
  // Tier 1 Base Plinth (12.0m wide x 6.0m deep x 0.35m height)
  const pTier1Geo = registerGeom(new THREE.BoxGeometry(platformWidth, 0.35, platformDepth));
  const pTier1 = new THREE.Mesh(pTier1Geo, sandstoneIvoryMat);
  pTier1.position.set(0, floorY + 0.175, sanctumZ);
  pTier1.receiveShadow = true;
  pTier1.castShadow = true;
  group.add(pTier1);

  // Tier 2 Middle Step (11.0m wide x 5.2m deep x 0.25m height)
  const pTier2Geo = registerGeom(new THREE.BoxGeometry(platformWidth - 1.0, 0.25, platformDepth - 0.8));
  const pTier2 = new THREE.Mesh(pTier2Geo, borderFriezeMat);
  pTier2.position.set(0, floorY + 0.35 + 0.125, sanctumZ);
  pTier2.receiveShadow = true;
  pTier2.castShadow = true;
  group.add(pTier2);

  // Tier 3 Sanctum Altar Dais (10.0m wide x 4.4m deep x 0.2m height)
  // Clean, dedicated flat platform surface at y = floorY + 0.8m (y = 1.45m world coordinate)
  const pTier3Geo = registerGeom(new THREE.BoxGeometry(platformWidth - 2.0, 0.2, platformDepth - 1.6));
  const pTier3 = new THREE.Mesh(pTier3Geo, sandstoneIvoryMat);
  pTier3.position.set(0, floorY + 0.6 + 0.1, sanctumZ);
  pTier3.receiveShadow = true;
  pTier3.castShadow = true;
  group.add(pTier3);

  // Ceremonial access stairs in front of platform (3 steps, 6.0m wide)
  const pStepCount = 3;
  const pStepDepth = 0.45;
  const pStepHeight = platformElevation / pStepCount;
  for (let s = 0; s < pStepCount; s++) {
    const stGeo = registerGeom(new THREE.BoxGeometry(6.4 - s * 0.3, pStepHeight, pStepDepth));
    const stMesh = new THREE.Mesh(stGeo, sandstoneIvoryMat);
    stMesh.position.set(
      0,
      floorY + (s + 0.5) * pStepHeight,
      sanctumZ + platformDepth / 2 + (pStepCount - 1 - s) * pStepDepth
    );
    stMesh.receiveShadow = true;
    stMesh.castShadow = true;
    group.add(stMesh);
  }

  // B. Grand Chalchitra / Prabhavali Architectural Backdrop Frame
  // Sits behind the dais at Z = -41.8, framing the future tableau
  const frameBackZ = sanctumZ - platformDepth / 2 + 0.4; // Z = -41.6

  // Stepped ornamental backdrop wall
  const backWallGeo = registerGeom(new THREE.BoxGeometry(11.0, 7.2, 0.6));
  const backWall = new THREE.Mesh(backWallGeo, plainTerracottaMat);
  backWall.position.set(0, floorY + 3.8, frameBackZ);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  group.add(backWall);

  // Flanking grand sanctum pillars (left at x = -5.0, right at x = +5.0)
  function createSanctumPillar(xPos) {
    const spGroup = new THREE.Group();
    spGroup.position.set(xPos, floorY + 0.8, frameBackZ + 0.3);

    const sBase = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.2, 0.4, 1.2)), sandstoneIvoryMat);
    sBase.position.y = 0.2;
    spGroup.add(sBase);

    const sShaft = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.35, 0.38, 5.8, 24)), terracottaMat);
    sShaft.position.y = 3.3;
    spGroup.add(sShaft);

    for (const y of [1.6, 3.2, 4.8]) {
      const ring = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.4, 0.05, 12, 24)), goldTrimMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      spGroup.add(ring);
    }

    const sCap = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.3, 0.5, 1.3)), goldTrimMat);
    sCap.position.y = 6.45;
    spGroup.add(sCap);

    return spGroup;
  }
  group.add(createSanctumPillar(-5.0));
  group.add(createSanctumPillar(5.0));

  // Grand semi-circular Chalchitra arch crest framing the tableau (outer radius 4.8m)
  const chalchitraArchGeo = registerGeom(new THREE.TorusGeometry(4.8, 0.35, 16, 32, Math.PI));
  const chalchitraArch = new THREE.Mesh(chalchitraArchGeo, goldTrimMat);
  chalchitraArch.position.set(0, floorY + 5.2, frameBackZ + 0.3);
  chalchitraArch.castShadow = true;
  group.add(chalchitraArch);

  // Inner terracotta relief arch band
  const innerArchGeo = registerGeom(new THREE.TorusGeometry(4.2, 0.25, 16, 32, Math.PI));
  const innerArch = new THREE.Mesh(innerArchGeo, terracottaMat);
  innerArch.position.set(0, floorY + 5.2, frameBackZ + 0.35);
  group.add(innerArch);

  // Arch crown Kalasha finial above the sanctum
  const sKalashGeo = registerGeom(new THREE.ConeGeometry(0.35, 1.2, 16));
  const sKalash = new THREE.Mesh(sKalashGeo, goldTrimMat);
  sKalash.position.set(0, floorY + 10.2, frameBackZ + 0.3);
  group.add(sKalash);

  // Dedicated rear enclosure wall closing the pandal at Z = -43.0
  const rearWallGeo = registerGeom(new THREE.BoxGeometry(hallWidth + 0.4, ceilingY - floorY, 0.8));
  const rearWall = new THREE.Mesh(rearWallGeo, plainTerracottaMat);
  rearWall.position.set(0, floorY + (ceilingY - floorY) / 2, hallEndZ);
  rearWall.castShadow = true;
  rearWall.receiveShadow = true;
  group.add(rearWall);

  // --- 9. HANGING CHANDELIERS & FESTIVAL LIGHTING ---
  // 3 Grand tiered chandeliers suspended along the central nave aisle (Z = -18, -25, -32)
  const chandelierZPositions = [-18.5, -25.5, -32.5];
  chandelierZPositions.forEach((cz) => {
    const chGroup = new THREE.Group();
    chGroup.position.set(0, ceilingY - 1.8, cz);

    // Brass suspension rod
    const rodGeo = registerGeom(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8));
    const rod = new THREE.Mesh(rodGeo, goldTrimMat);
    rod.position.y = 0.8;
    chGroup.add(rod);

    // Tier 1 upper ring
    const r1Geo = registerGeom(new THREE.TorusGeometry(0.9, 0.06, 12, 24));
    const r1 = new THREE.Mesh(r1Geo, goldTrimMat);
    r1.rotation.x = Math.PI / 2;
    chGroup.add(r1);

    // Tier 2 lower ring
    const r2Geo = registerGeom(new THREE.TorusGeometry(1.5, 0.08, 12, 24));
    const r2 = new THREE.Mesh(r2Geo, goldTrimMat);
    r2.rotation.x = Math.PI / 2;
    r2.position.y = -0.5;
    chGroup.add(r2);

    // Glowing pendant lamps on chandelier
    const lampCount = 8;
    for (let l = 0; l < lampCount; l++) {
      const angle = (l / lampCount) * Math.PI * 2;
      const lx = Math.cos(angle) * 1.5;
      const lz = Math.sin(angle) * 1.5;
      const bulb = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.12, 12, 12)), chandelierGlowMat);
      bulb.position.set(lx, -0.65, lz);
      chGroup.add(bulb);
    }

    // Warm chandelier illumination point light
    const chLight = new THREE.PointLight(0xffb84d, 1.9, 15, 1.8);
    chLight.position.set(0, -0.6, 0);
    chGroup.add(chLight);

    group.add(chGroup);
  });

  // Balanced architectural sanctum spotlight (soft fill on the display dais structure)
  const altarSpot = new THREE.SpotLight(0xffedd0, 1.8, 24, Math.PI / 4.2, 0.5, 1.2);
  altarSpot.position.set(0, ceilingY - 1.0, sanctumZ + 8.0);
  altarSpot.target.position.set(0, floorY + 1.8, sanctumZ);
  altarSpot.castShadow = true;
  group.add(altarSpot);
  group.add(altarSpot.target);

  // Warm fill light on the Chalchitra backdrop
  const backdropFill = new THREE.PointLight(0xffa038, 1.8, 12, 1.5);
  backdropFill.position.set(0, floorY + 4.5, sanctumZ - 1.0);
  group.add(backdropFill);

  // Add the interior group to the scene
  scene.add(group);

  function dispose() {
    scene.remove(group);
    disposables.forEach((item) => {
      if (item && item.dispose) item.dispose();
    });
  }

  return {
    group,
    tunnelStartZ,
    hallEndZ,
    floorY,
    ceilingY,
    sanctumZ,
    platformElevation,
    dispose,
  };
}
