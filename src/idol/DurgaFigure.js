import * as THREE from 'three';

/**
 * Creates the central sculptural 3D figure of Maa Durga (Dashabhuja).
 * Features authentic Bengali Kumartuli proportions, 10 clearly distinguishable arms,
 * traditional weapons, Daker Saaj filigree crown, layered jewellery, and dynamic stance.
 * 
 * @param {object} mats Materials collection from IdolMaterials
 * @param {function} registerGeom Helper to track geometries for disposal
 * @returns {THREE.Group}
 */
export function createDurgaFigure(mats, registerGeom) {
  const durga = new THREE.Group();
  durga.name = 'MaaDurgaCentralFigure';

  // Standing centrally on the elevated lotus dais
  durga.position.set(0, 0, 0);

  // ==========================================
  // 1. DYNAMIC STANCE & LOWER BODY
  // Right foot rests on Lion's flank (x = -0.4, y = 0.65)
  // Left foot plants forward on Mahishasura's shoulder (x = 0.45, y = 0.68)
  // ==========================================
  const lowerBody = new THREE.Group();

  // Right Leg Assembly (angled back resting on lion's back)
  const rLegGroup = new THREE.Group();
  rLegGroup.position.set(-0.35, 0.95, -0.05);
  rLegGroup.rotation.set(-0.15, 0, 0.18);
  const rLegGeo = registerGeom(new THREE.CylinderGeometry(0.16, 0.14, 0.85, 16));
  const rLeg = new THREE.Mesh(rLegGeo, mats.divineSkin);
  rLegGroup.add(rLeg);

  const rAnklet = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.14, 0.03, 8, 16)), mats.goldOrnaments);
  rAnklet.rotation.x = Math.PI / 2;
  rAnklet.position.set(0, -0.42, 0);
  rLegGroup.add(rAnklet);

  const rFoot = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.18, 0.12, 0.32)), mats.divineSkin);
  rFoot.position.set(0, -0.48, 0.08);
  rLegGroup.add(rFoot);
  lowerBody.add(rLegGroup);

  // Left Leg Assembly (extended forward pressing on demon's shoulder)
  const lLegGroup = new THREE.Group();
  lLegGroup.position.set(0.42, 0.92, 0.18);
  lLegGroup.rotation.set(0.22, 0, -0.32);
  const lLegGeo = registerGeom(new THREE.CylinderGeometry(0.16, 0.14, 0.9, 16));
  const lLeg = new THREE.Mesh(lLegGeo, mats.divineSkin);
  lLegGroup.add(lLeg);

  const lAnklet = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.14, 0.03, 8, 16)), mats.goldOrnaments);
  lAnklet.rotation.x = Math.PI / 2;
  lAnklet.position.set(0, -0.45, 0);
  lLegGroup.add(lAnklet);

  const lFoot = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.18, 0.12, 0.32)), mats.divineSkin);
  lFoot.position.set(0, -0.51, 0.08);
  lLegGroup.add(lFoot);
  lowerBody.add(lLegGroup);

  // Sculpted Pleated Royal Red Saree (Ghagra / Drapes)
  const sareeGeo = registerGeom(new THREE.CylinderGeometry(0.36, 0.78, 1.25, 24, 1, true));
  const saree = new THREE.Mesh(sareeGeo, mats.durgaSaree);
  saree.position.set(0.04, 1.25, 0.05);
  saree.castShadow = true;
  lowerBody.add(saree);

  // Cascading front pleated folds (Kunchi)
  const pleatGeo = registerGeom(new THREE.BoxGeometry(0.28, 1.15, 0.16));
  const pleat = new THREE.Mesh(pleatGeo, mats.durgaSaree);
  pleat.position.set(0.02, 1.2, 0.36);
  pleat.rotation.x = -0.1;
  lowerBody.add(pleat);

  durga.add(lowerBody);

  // ==========================================
  // 2. TORSO & WAIST
  // ==========================================
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.85, 0.05);

  const waistGeo = registerGeom(new THREE.CylinderGeometry(0.3, 0.34, 0.45, 16));
  const waist = new THREE.Mesh(waistGeo, mats.durgaSaree);
  waist.position.y = 0.15;
  torsoGroup.add(waist);

  // Golden waistband (Kamarbandh)
  const beltGeo = registerGeom(new THREE.TorusGeometry(0.33, 0.045, 8, 24));
  const belt = new THREE.Mesh(beltGeo, mats.goldOrnaments);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.05;
  torsoGroup.add(belt);

  // Upper Torso / Blouse
  const chestGeo = registerGeom(new THREE.CylinderGeometry(0.34, 0.28, 0.65, 16));
  const chest = new THREE.Mesh(chestGeo, mats.durgaSaree);
  chest.position.y = 0.65;
  chest.castShadow = true;
  torsoGroup.add(chest);

  // Layered golden necklaces (Haar, Chik)
  const neckGeo1 = registerGeom(new THREE.TorusGeometry(0.3, 0.035, 8, 24));
  const necklace1 = new THREE.Mesh(neckGeo1, mats.goldOrnaments);
  necklace1.rotation.x = Math.PI / 2.3;
  necklace1.position.set(0, 0.85, 0.08);
  torsoGroup.add(necklace1);

  const neckGeo2 = registerGeom(new THREE.TorusGeometry(0.24, 0.035, 8, 24));
  const necklace2 = new THREE.Mesh(neckGeo2, mats.goldOrnaments);
  necklace2.rotation.x = Math.PI / 2.3;
  necklace2.position.set(0, 0.95, 0.06);
  torsoGroup.add(necklace2);

  // Saree Pallu crossing over left shoulder
  const palluGeo = registerGeom(new THREE.BoxGeometry(0.22, 0.95, 0.1));
  const pallu = new THREE.Mesh(palluGeo, mats.durgaSaree);
  pallu.position.set(-0.16, 0.65, 0.2);
  pallu.rotation.z = -0.45;
  torsoGroup.add(pallu);

  durga.add(torsoGroup);

  // ==========================================
  // 3. HEAD, FACE, AND DAKER SAAJ MUKUT
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.95, 0.1);

  // Neck
  const neckMesh = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.13, 0.16, 0.28, 16)), mats.divineSkin);
  neckMesh.position.y = -0.14;
  headGroup.add(neckMesh);

  // Sculpted Head with painted Potua face texture
  // IMPORTANT: SphereGeometry requires rotation.y = -Math.PI / 2 to place u = 0.5 directly facing forward (+Z)
  const headMesh = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.25, 24, 24)), mats.durgaFace);
  headMesh.scale.set(0.95, 1.15, 1.0);
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Black hair locks
  const hairBackGeo = registerGeom(new THREE.SphereGeometry(0.3, 16, 16));
  const hairBack = new THREE.Mesh(hairBackGeo, mats.buffaloSkin);
  hairBack.scale.set(1.0, 1.3, 0.7);
  hairBack.position.set(0, 0.02, -0.12);
  headGroup.add(hairBack);

  // Golden Earrings (Jhumka)
  for (const side of [-1, 1]) {
    const earringGeo = registerGeom(new THREE.ConeGeometry(0.07, 0.18, 8));
    const earring = new THREE.Mesh(earringGeo, mats.goldOrnaments);
    earring.rotation.x = Math.PI;
    earring.position.set(side * 0.26, -0.12, 0.02);
    headGroup.add(earring);
  }

  // Bengali Daker Saaj Mukut (Stepped Filigree Crown)
  const cTier1Geo = registerGeom(new THREE.CylinderGeometry(0.28, 0.26, 0.2, 24));
  const cTier1 = new THREE.Mesh(cTier1Geo, mats.goldOrnaments);
  cTier1.position.y = 0.32;
  headGroup.add(cTier1);

  const cTier2Geo = registerGeom(new THREE.ConeGeometry(0.3, 0.52, 16));
  const cTier2 = new THREE.Mesh(cTier2Geo, mats.goldOrnaments);
  cTier2.position.y = 0.62;
  headGroup.add(cTier2);

  const cFinialGeo = registerGeom(new THREE.ConeGeometry(0.1, 0.36, 12));
  const cFinial = new THREE.Mesh(cFinialGeo, mats.goldOrnaments);
  cFinial.position.y = 0.98;
  headGroup.add(cFinial);

  // Golden Halo (Chuda)
  const haloGeo = registerGeom(new THREE.CylinderGeometry(0.62, 0.62, 0.035, 32));
  const halo = new THREE.Mesh(haloGeo, mats.goldOrnaments);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 0.45, -0.12);
  headGroup.add(halo);

  for (let r = 0; r < 16; r++) {
    const angle = (r / 16) * Math.PI * 2;
    const rayGeo = registerGeom(new THREE.ConeGeometry(0.035, 0.22, 6));
    const ray = new THREE.Mesh(rayGeo, mats.goldOrnaments);
    ray.position.set(Math.cos(angle) * 0.68, 0.45 + Math.sin(angle) * 0.68, -0.12);
    ray.rotation.z = angle - Math.PI / 2;
    headGroup.add(ray);
  }

  durga.add(headGroup);

  // ==========================================
  // 4. TEN CLEARLY DISTINGUISHABLE ARMS & WEAPONS
  // 5 Arms on Right (R1 to R5), 5 Arms on Left (L1 to L5)
  // Perfectly radial, deliberate fan, completely clearing the central face
  // ==========================================
  const armsGroup = new THREE.Group();
  armsGroup.position.set(0, 2.5, 0.05);

  function createArmSegment(length = 0.48, radius = 0.075) {
    const geo = registerGeom(new THREE.CylinderGeometry(radius * 0.85, radius, length, 10));
    const mesh = new THREE.Mesh(geo, mats.divineSkin);
    mesh.position.y = length / 2;
    mesh.castShadow = true;
    return mesh;
  }

  function addArmletAndBangles(parent, yPos = 0.35) {
    const armletGeo = registerGeom(new THREE.TorusGeometry(0.085, 0.022, 6, 12));
    const armlet = new THREE.Mesh(armletGeo, mats.goldOrnaments);
    armlet.rotation.x = Math.PI / 2;
    armlet.position.y = yPos;
    parent.add(armlet);
  }

  // --- RIGHT SIDE ARMS (R1 to R5) ---
  // R1: Primary Right Arm — Wielding the Trishula piercing Mahishasura
  // Placed on the right flank (x = 0.45) so the shaft does NOT occlude the head
  const armR1 = new THREE.Group();
  armR1.position.set(0.38, 0.05, 0.15);
  armR1.rotation.set(0.35, 0.2, -0.5);
  const upR1 = createArmSegment(0.5);
  addArmletAndBangles(upR1);
  armR1.add(upR1);

  const foreR1 = new THREE.Group();
  foreR1.position.set(0, 0.48, 0);
  foreR1.rotation.set(0.3, -0.1, 0.6);
  const downR1 = createArmSegment(0.48);
  addArmletAndBangles(downR1, 0.42);
  foreR1.add(downR1);

  // Sacred Trishula (Trident)
  // Hand holds shaft at y = 0.45; shaft angles down-forward into demon (x = 0.85, y = 1.0)
  // Upper shaft extends up-right, safely away from Durga's head (x = 0.0)
  const trishulaGroup = new THREE.Group();
  trishulaGroup.position.set(0.05, 0.45, 0.05);
  trishulaGroup.rotation.set(-0.35, 0.1, 0.55);

  const tShaft = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 12)), mats.weaponGold);
  tShaft.position.y = -0.4;
  trishulaGroup.add(tShaft);

  // Trident Prongs pointing downward into Mahishasura
  const tHeadGroup = new THREE.Group();
  tHeadGroup.position.y = -1.7;
  tHeadGroup.rotation.z = Math.PI;

  const centerProng = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.055, 0.5, 8)), mats.weaponSteel);
  centerProng.position.y = 0.25;
  tHeadGroup.add(centerProng);

  for (const side of [-1, 1]) {
    const prongCurve = registerGeom(new THREE.TorusGeometry(0.16, 0.025, 8, 16, Math.PI / 1.3));
    const sideProng = new THREE.Mesh(prongCurve, mats.weaponSteel);
    sideProng.rotation.z = side > 0 ? -Math.PI / 4 : Math.PI / 4 + Math.PI / 3;
    sideProng.position.set(side * 0.12, 0.08, 0);
    tHeadGroup.add(sideProng);
  }
  trishulaGroup.add(tHeadGroup);
  foreR1.add(trishulaGroup);
  armR1.add(foreR1);
  armsGroup.add(armR1);

  // R2: Upper High Right Arm — Khadga (Sword)
  const armR2 = new THREE.Group();
  armR2.position.set(0.38, 0.15, -0.05);
  armR2.rotation.set(-0.2, 0.2, -1.25);
  const upR2 = createArmSegment(0.5);
  addArmletAndBangles(upR2);
  armR2.add(upR2);

  const foreR2 = new THREE.Group();
  foreR2.position.set(0, 0.48, 0);
  foreR2.rotation.z = -0.45;
  const downR2 = createArmSegment(0.46);
  addArmletAndBangles(downR2, 0.4);
  foreR2.add(downR2);

  const swordGroup = new THREE.Group();
  swordGroup.position.set(0, 0.46, 0);
  const swordBlade = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.065, 0.8, 0.02)), mats.weaponSteel);
  swordBlade.position.y = 0.4;
  swordGroup.add(swordBlade);
  const swordHilt = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.16, 0.035, 0.04)), mats.weaponGold);
  swordGroup.add(swordHilt);
  foreR2.add(swordGroup);
  armR2.add(foreR2);
  armsGroup.add(armR2);

  // R3: Upper-Mid Right Arm — Sudarshana Chakra
  const armR3 = new THREE.Group();
  armR3.position.set(0.38, 0.0, -0.08);
  armR3.rotation.set(-0.1, 0.1, -1.65);
  const upR3 = createArmSegment(0.48);
  addArmletAndBangles(upR3);
  armR3.add(upR3);

  const foreR3 = new THREE.Group();
  foreR3.position.set(0, 0.46, 0);
  foreR3.rotation.z = -0.3;
  const downR3 = createArmSegment(0.44);
  addArmletAndBangles(downR3, 0.38);
  foreR3.add(downR3);

  const chakraGroup = new THREE.Group();
  chakraGroup.position.set(0, 0.44, 0);
  const chakraRing = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.22, 0.025, 8, 24)), mats.weaponGold);
  chakraGroup.add(chakraRing);
  for (let s = 0; s < 8; s++) {
    const spoke = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.02, 0.42, 0.015)), mats.weaponGold);
    spoke.rotation.z = (s / 8) * Math.PI;
    chakraGroup.add(spoke);
  }
  foreR3.add(chakraGroup);
  armR3.add(foreR3);
  armsGroup.add(armR3);

  // R4: Lower-Mid Right Arm — Teer (Golden Arrow)
  const armR4 = new THREE.Group();
  armR4.position.set(0.35, -0.12, -0.08);
  armR4.rotation.set(0.1, 0.0, -2.05);
  const upR4 = createArmSegment(0.46);
  addArmletAndBangles(upR4);
  armR4.add(upR4);

  const foreR4 = new THREE.Group();
  foreR4.position.set(0, 0.44, 0);
  foreR4.rotation.z = -0.25;
  const downR4 = createArmSegment(0.42);
  addArmletAndBangles(downR4, 0.38);
  foreR4.add(downR4);

  const arrow = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.016, 0.016, 0.9, 8)), mats.weaponGold);
  arrow.position.set(0, 0.42, 0);
  const arrowHead = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.045, 0.15, 6)), mats.weaponSteel);
  arrowHead.position.set(0, 0.88, 0);
  foreR4.add(arrow);
  foreR4.add(arrowHead);
  armR4.add(foreR4);
  armsGroup.add(armR4);

  // R5: Lowest Right Arm — Gada (Mace)
  const armR5 = new THREE.Group();
  armR5.position.set(0.32, -0.25, -0.05);
  armR5.rotation.set(0.2, -0.1, -2.5);
  const upR5 = createArmSegment(0.46);
  addArmletAndBangles(upR5);
  armR5.add(upR5);

  const foreR5 = new THREE.Group();
  foreR5.position.set(0, 0.44, 0);
  const downR5 = createArmSegment(0.42);
  addArmletAndBangles(downR5, 0.36);
  foreR5.add(downR5);

  const gada = new THREE.Group();
  gada.position.set(0, 0.42, 0);
  const gShaft = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.028, 0.032, 0.8, 8)), mats.weaponGold);
  gShaft.position.y = 0.4;
  gada.add(gShaft);
  const gHead = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.16, 12, 12)), mats.weaponGold);
  gHead.position.y = 0.8;
  gada.add(gHead);
  foreR5.add(gada);
  armR5.add(foreR5);
  armsGroup.add(armR5);

  // --- LEFT SIDE ARMS (L1 to L5) ---
  // L1: Primary Left Arm — Holding Nagpasha serpent coiling the demon
  const armL1 = new THREE.Group();
  armL1.position.set(-0.35, 0.05, 0.15);
  armL1.rotation.set(0.35, -0.3, 0.7);
  const upL1 = createArmSegment(0.5);
  addArmletAndBangles(upL1);
  armL1.add(upL1);

  const foreL1 = new THREE.Group();
  foreL1.position.set(0, 0.48, 0);
  foreL1.rotation.set(0.4, 0.2, -0.85);
  const downL1 = createArmSegment(0.46);
  addArmletAndBangles(downL1, 0.4);
  foreL1.add(downL1);
  armL1.add(foreL1);
  armsGroup.add(armL1);

  // L2: Upper High Left Arm — Shankha (Conch Shell)
  const armL2 = new THREE.Group();
  armL2.position.set(-0.38, 0.15, -0.05);
  armL2.rotation.set(-0.2, -0.2, 1.25);
  const upL2 = createArmSegment(0.5);
  addArmletAndBangles(upL2);
  armL2.add(upL2);

  const foreL2 = new THREE.Group();
  foreL2.position.set(0, 0.48, 0);
  foreL2.rotation.z = 0.45;
  const downL2 = createArmSegment(0.46);
  addArmletAndBangles(downL2, 0.4);
  foreL2.add(downL2);

  const shankha = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.11, 0.3, 12)), mats.whiteSwan);
  shankha.rotation.z = Math.PI / 4;
  shankha.position.set(0, 0.46, 0);
  foreL2.add(shankha);
  armL2.add(foreL2);
  armsGroup.add(armL2);

  // L3: Upper-Mid Left Arm — Kheta (Golden Shield)
  const armL3 = new THREE.Group();
  armL3.position.set(-0.38, 0.0, -0.08);
  armL3.rotation.set(-0.1, -0.1, 1.65);
  const upL3 = createArmSegment(0.48);
  addArmletAndBangles(upL3);
  armL3.add(upL3);

  const foreL3 = new THREE.Group();
  foreL3.position.set(0, 0.46, 0);
  foreL3.rotation.z = 0.3;
  const downL3 = createArmSegment(0.44);
  addArmletAndBangles(downL3, 0.38);
  foreL3.add(downL3);

  const shield = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 16)), mats.weaponGold);
  shield.rotation.x = Math.PI / 2;
  shield.position.set(0, 0.44, 0.05);
  foreL3.add(shield);
  armL3.add(foreL3);
  armsGroup.add(armL3);

  // L4: Lower-Mid Left Arm — Dhanush (Bow)
  const armL4 = new THREE.Group();
  armL4.position.set(-0.35, -0.12, -0.08);
  armL4.rotation.set(0.1, 0.0, 2.05);
  const upL4 = createArmSegment(0.46);
  addArmletAndBangles(upL4);
  armL4.add(upL4);

  const foreL4 = new THREE.Group();
  foreL4.position.set(0, 0.44, 0);
  foreL4.rotation.z = 0.25;
  const downL4 = createArmSegment(0.42);
  addArmletAndBangles(downL4, 0.38);
  foreL4.add(downL4);

  const bow = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.52, 0.03, 8, 20, Math.PI / 1.3)), mats.weaponGold);
  bow.rotation.z = Math.PI / 4;
  bow.position.set(0, 0.44, 0);
  foreL4.add(bow);
  armL4.add(foreL4);
  armsGroup.add(armL4);

  // L5: Lowest Left Arm — Sacred Pink Lotus Blossom (Padma)
  const armL5 = new THREE.Group();
  armL5.position.set(-0.32, -0.25, -0.05);
  armL5.rotation.set(0.2, 0.1, 2.5);
  const upL5 = createArmSegment(0.46);
  addArmletAndBangles(upL5);
  armL5.add(upL5);

  const foreL5 = new THREE.Group();
  foreL5.position.set(0, 0.44, 0);
  const downL5 = createArmSegment(0.42);
  addArmletAndBangles(downL5, 0.36);
  foreL5.add(downL5);

  const lotusGroup = new THREE.Group();
  lotusGroup.position.set(0, 0.42, 0);
  const stem = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 6)), mats.peacockFeather);
  stem.position.y = 0.14;
  lotusGroup.add(stem);
  const petalCup = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.11, 10, 10)), mats.sacredLotus);
  petalCup.position.y = 0.32;
  lotusGroup.add(petalCup);
  foreL5.add(lotusGroup);
  armL5.add(foreL5);
  armsGroup.add(armL5);

  durga.add(armsGroup);

  return durga;
}
