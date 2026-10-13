import * as THREE from 'three';
import {
  createTerracottaPanelTexture,
  createOrnamentalBorderTexture,
  createAlponaRunnerTexture,
  createPavingTexture,
} from './ExteriorTextures.js';

/**
 * Creates the Grand Kolkata-style Durga Puja Pandal Exterior Architecture.
 * 
 * Architectural Theme: Grand Heritage Terracotta & Sandstone Festival Pavilion
 * Dimensions: ~34m wide, ~16.5m high, entrance clear aperture 6.6m wide x 6.0m high x 7.0m deep.
 * Scale: 1 Three.js unit = 1 metre.
 * 
 * @param {THREE.Scene} scene 
 * @returns {{ group: THREE.Group, dispose: () => void }}
 */
export function createExterior(scene) {
  const group = new THREE.Group();
  group.name = 'PandalExterior';

  // --- 1. PROCEDURAL TEXTURES & SHARED MATERIALS ---
  const terracottaTex = createTerracottaPanelTexture();
  terracottaTex.repeat.set(1, 1);

  const borderTex = createOrnamentalBorderTexture();
  borderTex.repeat.set(4, 1);

  const runnerTex = createAlponaRunnerTexture();
  runnerTex.repeat.set(1, 10);

  const pavingTex = createPavingTexture();
  pavingTex.repeat.set(8, 8);

  // Materials
  const terracottaMat = new THREE.MeshStandardMaterial({
    map: terracottaTex,
    color: 0xa84528,
    roughness: 0.65,
    metalness: 0.08,
  });

  const plainTerracottaMat = new THREE.MeshStandardMaterial({
    color: 0x933b20,
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

  const darkWoodTrimMat = new THREE.MeshStandardMaterial({
    color: 0x3d261e,
    roughness: 0.7,
    metalness: 0.1,
  });

  const carpetMat = new THREE.MeshStandardMaterial({
    map: runnerTex,
    roughness: 0.85,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });

  const plazaMat = new THREE.MeshStandardMaterial({
    map: pavingTex,
    roughness: 0.8,
    metalness: 0.1,
  });

  const bulbEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xffe6a3,
    emissive: 0xffaa33,
    emissiveIntensity: 3.5,
    roughness: 0.2,
  });

  // Track all disposables
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
    darkWoodTrimMat,
    carpetMat,
    plazaMat,
    bulbEmissiveMat,
  ];

  function registerGeom(geo) {
    disposables.push(geo);
    return geo;
  }

  // --- 2. ELEVATED PLINTH & APPROACH PLAZA ---
  // Pandal center is placed at Z = -12, facing positive Z (approaching from Z = +15 towards Z = -12)
  const pandalZ = -12;

  // Base elevated plinth (36m wide, 0.6m high, 16m deep)
  const plinthGeo = registerGeom(new THREE.BoxGeometry(36, 0.6, 16));
  const plinthMesh = new THREE.Mesh(plinthGeo, sandstoneIvoryMat);
  plinthMesh.position.set(0, 0.3, pandalZ);
  plinthMesh.receiveShadow = true;
  plinthMesh.castShadow = true;
  group.add(plinthMesh);

  // Plinth decorative coping trim
  const copingGeo = registerGeom(new THREE.BoxGeometry(36.4, 0.15, 16.4));
  const copingMesh = new THREE.Mesh(copingGeo, borderFriezeMat);
  copingMesh.position.set(0, 0.65, pandalZ);
  copingMesh.castShadow = true;
  copingMesh.receiveShadow = true;
  group.add(copingMesh);

  // Ceremonial entrance steps (4 steps, 14m wide)
  const stepCount = 4;
  const stepDepth = 0.5;
  const stepHeight = 0.6 / stepCount;
  for (let s = 0; s < stepCount; s++) {
    const sWidth = 14 - s * 0.4;
    const sGeo = registerGeom(new THREE.BoxGeometry(sWidth, stepHeight, stepDepth));
    const step = new THREE.Mesh(sGeo, sandstoneIvoryMat);
    const stepZ = pandalZ + 8 + (stepCount - 1 - s) * stepDepth;
    step.position.set(
      0,
      (s + 0.5) * stepHeight,
      stepZ
    );
    step.receiveShadow = true;
    step.castShadow = true;
    group.add(step);

    // Stepped red carpet runner along each step tread and riser
    const treadGeo = registerGeom(new THREE.PlaneGeometry(4.8, stepDepth));
    const tread = new THREE.Mesh(treadGeo, carpetMat);
    tread.rotation.x = -Math.PI / 2;
    tread.position.set(0, (s + 1) * stepHeight + 0.005, stepZ);
    tread.receiveShadow = true;
    group.add(tread);

    const riserGeo = registerGeom(new THREE.PlaneGeometry(4.8, stepHeight));
    const riser = new THREE.Mesh(riserGeo, carpetMat);
    riser.position.set(0, (s + 0.5) * stepHeight, stepZ + stepDepth / 2 + 0.003);
    riser.receiveShadow = true;
    group.add(riser);
  }

  // Plaza paving apron surrounding the approach path
  const plazaGeo = registerGeom(new THREE.PlaneGeometry(50, 30));
  const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
  plazaMesh.rotation.x = -Math.PI / 2;
  plazaMesh.position.set(0, 0.01, pandalZ + 20);
  plazaMesh.receiveShadow = true;
  group.add(plazaMesh);

  // Ceremonial red & alpona runner leading straight to the bottom step of the stairs:
  // Starts at Z = 40.0 (near the mela entrance Toran) and reaches Z = -2.25 (base of step 0).
  // Total length = 42.25m, width = 4.8m.
  // Elevated to Y = 0.035m (safely above the 0.02m walkway and 0.01m plaza) with polygonOffset,
  // completely eliminating Z-fighting, tearing, or pop-in on camera movement.
  const approachRunnerLength = 42.25;
  const runnerGeo = registerGeom(new THREE.PlaneGeometry(4.8, approachRunnerLength));
  const runnerMesh = new THREE.Mesh(runnerGeo, carpetMat);
  runnerMesh.rotation.x = -Math.PI / 2;
  runnerMesh.position.set(0, 0.035, (40.0 + -2.25) / 2);
  runnerMesh.receiveShadow = true;
  group.add(runnerMesh);

  // Continuous red carpet runner through the portal and tunnel (from top step Z = -3.8 to interior Z = -13.0)
  // Sits cleanly at Y = 0.732m on top of the plinth coping surface (Y = 0.725m)
  const tunnelRunnerLength = 9.2;
  const tunnelRunnerGeo = registerGeom(new THREE.PlaneGeometry(4.8, tunnelRunnerLength));
  const tunnelRunner = new THREE.Mesh(tunnelRunnerGeo, carpetMat);
  tunnelRunner.rotation.x = -Math.PI / 2;
  tunnelRunner.position.set(0, 0.732, (-3.8 + -13.0) / 2);
  tunnelRunner.receiveShadow = true;
  group.add(tunnelRunner);

  // --- 3. GRAND CENTRAL GATEWAY (TORAN) & OPEN TUNNEL ---
  // The entrance gateway has a clear passage: 6.6m width, 6.0m height, extending 7.0m deep into Z
  const entranceWidth = 6.6;
  const entranceHeight = 6.0;
  const tunnelDepth = 7.0;
  const facadeFrontZ = pandalZ + 6.0; // Z = -6.0 is the front face of the facade

  // Open tunnel floor (continuous into the building)
  const tunnelFloorGeo = registerGeom(new THREE.BoxGeometry(entranceWidth, 0.1, tunnelDepth));
  const tunnelFloor = new THREE.Mesh(tunnelFloorGeo, sandstoneIvoryMat);
  tunnelFloor.position.set(0, 0.65, facadeFrontZ - tunnelDepth / 2);
  tunnelFloor.receiveShadow = true;
  group.add(tunnelFloor);

  // Tunnel interior side walls (establishing real 3D passage depth)
  const tunnelWallGeo = registerGeom(new THREE.BoxGeometry(0.4, entranceHeight, tunnelDepth));
  const leftTunnelWall = new THREE.Mesh(tunnelWallGeo, plainTerracottaMat);
  leftTunnelWall.position.set(-entranceWidth / 2 - 0.2, 0.6 + entranceHeight / 2, facadeFrontZ - tunnelDepth / 2);
  leftTunnelWall.castShadow = true;
  leftTunnelWall.receiveShadow = true;
  group.add(leftTunnelWall);

  const rightTunnelWall = new THREE.Mesh(tunnelWallGeo, plainTerracottaMat);
  rightTunnelWall.position.set(entranceWidth / 2 + 0.2, 0.6 + entranceHeight / 2, facadeFrontZ - tunnelDepth / 2);
  rightTunnelWall.castShadow = true;
  rightTunnelWall.receiveShadow = true;
  group.add(rightTunnelWall);

  // Tunnel ceiling with decorative transverse beams
  const tunnelCeilingGeo = registerGeom(new THREE.BoxGeometry(entranceWidth + 0.4, 0.3, tunnelDepth));
  const tunnelCeiling = new THREE.Mesh(tunnelCeilingGeo, darkWoodTrimMat);
  tunnelCeiling.position.set(0, 0.6 + entranceHeight + 0.15, facadeFrontZ - tunnelDepth / 2);
  tunnelCeiling.castShadow = true;
  tunnelCeiling.receiveShadow = true;
  group.add(tunnelCeiling);

  for (let b = 0; b < 5; b++) {
    const beamGeo = registerGeom(new THREE.BoxGeometry(entranceWidth, 0.25, 0.3));
    const beam = new THREE.Mesh(beamGeo, goldTrimMat);
    beam.position.set(0, 0.6 + entranceHeight - 0.1, facadeFrontZ - b * 1.5 - 0.5);
    beam.castShadow = true;
    group.add(beam);
  }

  // --- 4. GRAND PORTAL COLUMNS & ARCHES ---
  // Grand fluted column clusters flanking the portal (left at x = -4.0, right at x = +4.0)
  function createColumnCluster(xPos) {
    const colGroup = new THREE.Group();
    colGroup.position.set(xPos, 0.6, facadeFrontZ);

    // Stepped plinth base
    const b1 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.6, 0.4, 1.6)), sandstoneIvoryMat);
    b1.position.y = 0.2;
    b1.castShadow = true;
    b1.receiveShadow = true;
    colGroup.add(b1);

    const b2 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.3, 0.3, 1.3)), borderFriezeMat);
    b2.position.y = 0.55;
    b2.castShadow = true;
    colGroup.add(b2);

    // Twin fluted column shafts (main and secondary)
    const shaftGeo = registerGeom(new THREE.CylinderGeometry(0.38, 0.42, 5.2, 24));
    const shaft = new THREE.Mesh(shaftGeo, terracottaMat);
    shaft.position.set(0, 3.3, 0);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    colGroup.add(shaft);

    // Gold decorative bands around the shaft
    for (let ringY of [1.6, 3.2, 4.8]) {
      const ring = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.42, 0.05, 12, 24)), goldTrimMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, ringY, 0);
      ring.castShadow = true;
      colGroup.add(ring);
    }

    // Carved capital with brackets
    const cap1 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.3, 0.4, 1.3)), borderFriezeMat);
    cap1.position.y = 6.1;
    cap1.castShadow = true;
    colGroup.add(cap1);

    const cap2 = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(1.6, 0.3, 1.6)), goldTrimMat);
    cap2.position.y = 6.45;
    cap2.castShadow = true;
    colGroup.add(cap2);

    return colGroup;
  }

  group.add(createColumnCluster(-3.9));
  group.add(createColumnCluster(3.9));

  // Layered Toran Beam / Lintel spanning the entrance portal
  const lintelBeamGeo = registerGeom(new THREE.BoxGeometry(9.6, 0.9, 1.4));
  const lintelBeam = new THREE.Mesh(lintelBeamGeo, borderFriezeMat);
  lintelBeam.position.set(0, 0.6 + 6.6, facadeFrontZ);
  lintelBeam.castShadow = true;
  lintelBeam.receiveShadow = true;
  group.add(lintelBeam);

  const lintelTrimGeo = registerGeom(new THREE.BoxGeometry(10.0, 0.25, 1.6));
  const lintelTrim = new THREE.Mesh(lintelTrimGeo, goldTrimMat);
  lintelTrim.position.set(0, 0.6 + 7.15, facadeFrontZ);
  lintelTrim.castShadow = true;
  group.add(lintelTrim);

  // Multi-foil decorative entrance arch (segmented 3D arch ring)
  const archSegments = 16;
  const archRadius = entranceWidth / 2;
  const archCenterY = 0.6 + 4.2;
  for (let a = 0; a <= archSegments; a++) {
    const angle = (a / archSegments) * Math.PI;
    const ax = Math.cos(angle) * archRadius;
    const ay = Math.sin(angle) * (entranceHeight - 4.2) + archCenterY;
    const blockGeo = registerGeom(new THREE.BoxGeometry(0.7, 0.5, 0.8));
    const archBlock = new THREE.Mesh(blockGeo, (a % 2 === 0) ? terracottaMat : sandstoneIvoryMat);
    archBlock.position.set(ax, ay, facadeFrontZ + 0.1);
    archBlock.rotation.z = angle - Math.PI / 2;
    archBlock.castShadow = true;
    archBlock.receiveShadow = true;
    group.add(archBlock);
  }

  // Ornate Tympanum / Pediment above the entrance arch (Y: 7.8m to 11.5m)
  const pedimentBaseGeo = registerGeom(new THREE.BoxGeometry(9.2, 2.2, 0.8));
  const pedimentBase = new THREE.Mesh(pedimentBaseGeo, terracottaMat);
  pedimentBase.position.set(0, 0.6 + 8.2, facadeFrontZ);
  pedimentBase.castShadow = true;
  pedimentBase.receiveShadow = true;
  group.add(pedimentBase);

  // Central ornate medallion cartouche in pediment
  const medallionGeo = registerGeom(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32));
  const medallion = new THREE.Mesh(medallionGeo, goldTrimMat);
  medallion.rotation.x = Math.PI / 2;
  medallion.position.set(0, 0.6 + 8.2, facadeFrontZ + 0.45);
  medallion.castShadow = true;
  group.add(medallion);

  const innerMedallionGeo = registerGeom(new THREE.CylinderGeometry(0.9, 0.9, 0.45, 32));
  const innerMedallion = new THREE.Mesh(innerMedallionGeo, terracottaMat);
  innerMedallion.rotation.x = Math.PI / 2;
  innerMedallion.position.set(0, 0.6 + 8.2, facadeFrontZ + 0.5);
  group.add(innerMedallion);

  // --- 5. SYMMETRICAL SIDE WINGS (LEFT & RIGHT) ---
  // Left Wing: x = -13.5 (spanning -4.8 to -17.2, width 12.4m, height 10.5m)
  // Right Wing: x = +13.5 (spanning +4.8 to +17.2, width 12.4m, height 10.5m)
  function createSideWing(isLeft) {
    const wing = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    const wingCenterX = sign * 11.0;

    // Main structural wall backing (12.4m wide, 10.0m high, 1.2m thick)
    const wallGeo = registerGeom(new THREE.BoxGeometry(12.4, 10.0, 1.2));
    const wall = new THREE.Mesh(wallGeo, plainTerracottaMat);
    wall.position.set(wingCenterX, 0.6 + 5.0, facadeFrontZ - 0.3);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wing.add(wall);

    // Decorative wall bays with recessed terracotta relief panels (3 bays per wing)
    const bayCount = 3;
    const baySpacing = 3.6;
    for (let i = 0; i < bayCount; i++) {
      const bayX = wingCenterX + (i - 1) * baySpacing;

      // Outer molded frame
      const frameGeo = registerGeom(new THREE.BoxGeometry(2.8, 4.4, 0.3));
      const frame = new THREE.Mesh(frameGeo, sandstoneIvoryMat);
      frame.position.set(bayX, 0.6 + 4.2, facadeFrontZ + 0.35);
      frame.castShadow = true;
      wing.add(frame);

      // Recessed terracotta relief panel
      const panelGeo = registerGeom(new THREE.BoxGeometry(2.4, 4.0, 0.2));
      const panel = new THREE.Mesh(panelGeo, terracottaMat);
      panel.position.set(bayX, 0.6 + 4.2, facadeFrontZ + 0.45);
      panel.castShadow = true;
      panel.receiveShadow = true;
      wing.add(panel);

      // Arch crown over each panel
      const archHeadGeo = registerGeom(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 16, 1, false, 0, Math.PI));
      const archHead = new THREE.Mesh(archHeadGeo, goldTrimMat);
      archHead.rotation.z = -Math.PI / 2;
      archHead.rotation.y = Math.PI / 2;
      archHead.position.set(bayX, 0.6 + 6.4, facadeFrontZ + 0.35);
      archHead.castShadow = true;
      wing.add(archHead);

      // Lower decorative balustrade sill
      const sillGeo = registerGeom(new THREE.BoxGeometry(2.8, 0.4, 0.5));
      const sill = new THREE.Mesh(sillGeo, borderFriezeMat);
      sill.position.set(bayX, 0.6 + 1.8, facadeFrontZ + 0.4);
      sill.castShadow = true;
      wing.add(sill);

      // Flanking intermediate pilaster columns between bays
      const colGeo = registerGeom(new THREE.CylinderGeometry(0.25, 0.28, 8.5, 16));
      const col = new THREE.Mesh(colGeo, sandstoneIvoryMat);
      col.position.set(bayX + 1.7, 0.6 + 4.25, facadeFrontZ + 0.3);
      col.castShadow = true;
      wing.add(col);
    }

    // Wing lower cornice and upper frieze
    const corniceGeo = registerGeom(new THREE.BoxGeometry(13.2, 0.6, 1.6));
    const cornice = new THREE.Mesh(corniceGeo, borderFriezeMat);
    cornice.position.set(wingCenterX, 0.6 + 9.8, facadeFrontZ);
    cornice.castShadow = true;
    wing.add(cornice);

    // Decorative stepped chhajja / eaves projecting forward
    const eaveGeo = registerGeom(new THREE.BoxGeometry(13.6, 0.25, 2.0));
    const eave = new THREE.Mesh(eaveGeo, goldTrimMat);
    eave.position.set(wingCenterX, 0.6 + 10.2, facadeFrontZ + 0.2);
    eave.castShadow = true;
    wing.add(eave);

    // Parapet balustrade with decorative merlons
    const parapetGeo = registerGeom(new THREE.BoxGeometry(13.0, 1.2, 0.6));
    const parapet = new THREE.Mesh(parapetGeo, terracottaMat);
    parapet.position.set(wingCenterX, 0.6 + 10.9, facadeFrontZ - 0.2);
    parapet.castShadow = true;
    wing.add(parapet);

    // Corner pavilion spire / chhatri kiosk on outer wing ends
    const cornerX = sign * 16.5;
    const cornerPillarGeo = registerGeom(new THREE.BoxGeometry(1.6, 11.5, 1.6));
    const cornerPillar = new THREE.Mesh(cornerPillarGeo, sandstoneIvoryMat);
    cornerPillar.position.set(cornerX, 0.6 + 5.75, facadeFrontZ);
    cornerPillar.castShadow = true;
    wing.add(cornerPillar);

    // Kalasha finial on corner spire
    const finialBaseGeo = registerGeom(new THREE.CylinderGeometry(0.6, 0.8, 0.8, 16));
    const finialBase = new THREE.Mesh(finialBaseGeo, borderFriezeMat);
    finialBase.position.set(cornerX, 0.6 + 11.9, facadeFrontZ);
    finialBase.castShadow = true;
    wing.add(finialBase);

    const finialPotGeo = registerGeom(new THREE.SphereGeometry(0.5, 16, 16));
    const finialPot = new THREE.Mesh(finialPotGeo, goldTrimMat);
    finialPot.position.set(cornerX, 0.6 + 12.6, facadeFrontZ);
    finialPot.castShadow = true;
    wing.add(finialPot);

    const finialSpireGeo = registerGeom(new THREE.ConeGeometry(0.2, 1.0, 12));
    const finialSpire = new THREE.Mesh(finialSpireGeo, goldTrimMat);
    finialSpire.position.set(cornerX, 0.6 + 13.3, facadeFrontZ);
    finialSpire.castShadow = true;
    wing.add(finialSpire);

    return wing;
  }

  group.add(createSideWing(true));
  group.add(createSideWing(false));

  // --- 6. UPPER SUPERSTRUCTURE & CENTRAL ROOFLINE SHIKHARA ---
  // Stepped central tiers rising to ~16.5m (traditional Bishnupur Ratna / Chala festival temple silhouette)
  
  // Tier 1 (Width 16m, Depth 4m, Height 2.2m)
  const tier1Geo = registerGeom(new THREE.BoxGeometry(16.0, 2.2, 3.6));
  const tier1 = new THREE.Mesh(tier1Geo, plainTerracottaMat);
  tier1.position.set(0, 0.6 + 10.6, facadeFrontZ - 1.2);
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  group.add(tier1);

  const tier1FriezeGeo = registerGeom(new THREE.BoxGeometry(16.4, 0.5, 3.8));
  const tier1Frieze = new THREE.Mesh(tier1FriezeGeo, borderFriezeMat);
  tier1Frieze.position.set(0, 0.6 + 11.8, facadeFrontZ - 1.2);
  tier1Frieze.castShadow = true;
  group.add(tier1Frieze);

  // Tier 2 (Width 11m, Depth 3.2m, Height 2.0m)
  const tier2Geo = registerGeom(new THREE.BoxGeometry(11.0, 2.0, 3.0));
  const tier2 = new THREE.Mesh(tier2Geo, terracottaMat);
  tier2.position.set(0, 0.6 + 12.9, facadeFrontZ - 1.4);
  tier2.castShadow = true;
  tier2.receiveShadow = true;
  group.add(tier2);

  const tier2TrimGeo = registerGeom(new THREE.BoxGeometry(11.4, 0.4, 3.2));
  const tier2Trim = new THREE.Mesh(tier2TrimGeo, goldTrimMat);
  tier2Trim.position.set(0, 0.6 + 14.0, facadeFrontZ - 1.4);
  tier2Trim.castShadow = true;
  group.add(tier2Trim);

  // Stepped Curved Bengal Chala Roof Crown (Width 7.5m, Height 1.6m, Depth 2.6m)
  const chalaGeo = registerGeom(new THREE.CylinderGeometry(3.0, 4.4, 1.6, 24, 1, false, 0, Math.PI));
  const chalaMesh = new THREE.Mesh(chalaGeo, terracottaMat);
  chalaMesh.rotation.z = -Math.PI / 2;
  chalaMesh.rotation.y = Math.PI / 2;
  chalaMesh.position.set(0, 0.6 + 14.8, facadeFrontZ - 1.4);
  chalaMesh.castShadow = true;
  group.add(chalaMesh);

  // Grand Golden Kalasha & Lotus Crown Finial reaching ~16.5m
  const kalashBaseGeo = registerGeom(new THREE.CylinderGeometry(1.2, 1.5, 0.5, 24));
  const kalashBase = new THREE.Mesh(kalashBaseGeo, borderFriezeMat);
  kalashBase.position.set(0, 0.6 + 15.2, facadeFrontZ - 1.4);
  kalashBase.castShadow = true;
  group.add(kalashBase);

  const kalashPotGeo = registerGeom(new THREE.SphereGeometry(0.85, 24, 20));
  const kalashPot = new THREE.Mesh(kalashPotGeo, goldTrimMat);
  kalashPot.position.set(0, 0.6 + 15.8, facadeFrontZ - 1.4);
  kalashPot.castShadow = true;
  group.add(kalashPot);

  const kalashSpireGeo = registerGeom(new THREE.ConeGeometry(0.35, 1.4, 16));
  const kalashSpire = new THREE.Mesh(kalashSpireGeo, goldTrimMat);
  kalashSpire.position.set(0, 0.6 + 16.8, facadeFrontZ - 1.4);
  kalashSpire.castShadow = true;
  group.add(kalashSpire);

  // --- 7. EVENING FESTIVAL LIGHTING & EMISSIVE BULBS ---
  // A. Decorative fairy light strings outlining the grand entrance arch and cornices
  const bulbGeo = registerGeom(new THREE.SphereGeometry(0.07, 8, 8));
  const bulbCount = 36;
  const bulbRadius = entranceWidth / 2 + 0.2;
  for (let b = 0; b < bulbCount; b++) {
    const angle = (b / (bulbCount - 1)) * Math.PI;
    const bx = Math.cos(angle) * bulbRadius;
    const by = Math.sin(angle) * (entranceHeight - 3.8) + (0.6 + 3.8);
    const bulb = new THREE.Mesh(bulbGeo, bulbEmissiveMat);
    bulb.position.set(bx, by, facadeFrontZ + 0.45);
    group.add(bulb);
  }

  // Fairy light strings outlining the lower cornice beam
  const beamBulbCount = 28;
  for (let b = 0; b < beamBulbCount; b++) {
    const bx = -14.0 + (b / (beamBulbCount - 1)) * 28.0;
    const bulb = new THREE.Mesh(bulbGeo, bulbEmissiveMat);
    bulb.position.set(bx, 0.6 + 10.3, facadeFrontZ + 0.6);
    group.add(bulb);
  }

  // Fairy light strings on the upper tier cornice
  const upperBulbCount = 18;
  for (let b = 0; b < upperBulbCount; b++) {
    const bx = -7.0 + (b / (upperBulbCount - 1)) * 14.0;
    const bulb = new THREE.Mesh(bulbGeo, bulbEmissiveMat);
    bulb.position.set(bx, 0.6 + 14.2, facadeFrontZ - 0.8);
    group.add(bulb);
  }

  // B. Warm architectural accent floodlights
  // 1. Entrance gateway warm wash light
  const entranceFlood = new THREE.PointLight(0xffb84d, 2.8, 14, 1.5);
  entranceFlood.position.set(0, 0.6 + 5.5, facadeFrontZ + 2.5);
  group.add(entranceFlood);

  // 2. Left and Right wing architectural wash lights
  const leftWash = new THREE.PointLight(0xff9933, 2.0, 16, 1.8);
  leftWash.position.set(-11.0, 0.6 + 4.5, facadeFrontZ + 3.0);
  group.add(leftWash);

  const rightWash = new THREE.PointLight(0xff9933, 2.0, 16, 1.8);
  rightWash.position.set(11.0, 0.6 + 4.5, facadeFrontZ + 3.0);
  group.add(rightWash);

  // 3. Central Shikhara crown warm spotlight
  const crownSpot = new THREE.SpotLight(0xffd580, 3.5, 20, Math.PI / 4, 0.3, 1.5);
  crownSpot.position.set(0, 0.6 + 8.0, facadeFrontZ + 6.0);
  crownSpot.target.position.set(0, 0.6 + 15.0, facadeFrontZ - 1.4);
  group.add(crownSpot);
  group.add(crownSpot.target);

  // C. Flanking plaza entrance lampposts / ceremonial stambhas
  function createPlazaLamppost(xPos, zPos) {
    const postGroup = new THREE.Group();
    postGroup.position.set(xPos, 0, zPos);

    // Stone base pedestal
    const pBase = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.8, 0.6, 0.8)), sandstoneIvoryMat);
    pBase.position.y = 0.3;
    pBase.castShadow = true;
    pBase.receiveShadow = true;
    postGroup.add(pBase);

    // Fluted brass post shaft
    const pShaft = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 16)), goldTrimMat);
    pShaft.position.y = 1.8;
    pShaft.castShadow = true;
    postGroup.add(pShaft);

    // Decorative lantern housing
    const pLantern = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 8)), darkWoodTrimMat);
    pLantern.position.y = 3.2;
    pLantern.castShadow = true;
    postGroup.add(pLantern);

    // Glowing lantern globe
    const pGlobe = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.2, 16, 16)), bulbEmissiveMat);
    pGlobe.position.y = 3.2;
    postGroup.add(pGlobe);

    // Point light inside lantern
    const postLight = new THREE.PointLight(0xffae42, 1.6, 9, 2);
    postLight.position.y = 3.2;
    postGroup.add(postLight);

    return postGroup;
  }

  group.add(createPlazaLamppost(-3.4, pandalZ + 12));
  group.add(createPlazaLamppost(3.4, pandalZ + 12));
  group.add(createPlazaLamppost(-3.4, pandalZ + 20));
  group.add(createPlazaLamppost(3.4, pandalZ + 20));

  // Add the complete exterior group to the scene
  scene.add(group);

  // Cleanup helper
  function dispose() {
    scene.remove(group);
    disposables.forEach((item) => {
      if (item && item.dispose) item.dispose();
    });
  }

  return {
    group,
    pandalZ,
    facadeFrontZ,
    entranceWidth,
    entranceHeight,
    tunnelDepth,
    dispose,
  };
}
