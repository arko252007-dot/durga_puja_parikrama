import * as THREE from 'three';

/**
 * Creates the four traditional supporting deities of the Bengali Durga Puja Tableau:
 * 1. Lord Ganesha (Far Left: x = -3.8m)
 * 2. Goddess Lakshmi (Mid Left: x = -2.0m)
 * 3. Goddess Saraswati (Mid Right: x = +2.0m)
 * 4. Lord Kartikeya (Far Right: x = +3.8m)
 * Along with their respective traditional vahanas (Mouse, Owl, Swan, Peacock).
 * 
 * @param {object} mats Materials collection from IdolMaterials
 * @param {function} registerGeom Helper to track geometries for disposal
 * @returns {THREE.Group}
 */
export function createSupportingDeities(mats, registerGeom) {
  const group = new THREE.Group();
  group.name = 'SupportingDeitiesGroup';

  // Helper for basic human deity anatomy (height ~2.3m)
  function createBasicDeityBody(dhotiMat, skinMat) {
    const bGroup = new THREE.Group();

    // Standing Legs / Lower Dhoti
    const lowerGeo = registerGeom(new THREE.CylinderGeometry(0.24, 0.42, 1.1, 16));
    const lower = new THREE.Mesh(lowerGeo, dhotiMat);
    lower.position.y = 0.55;
    lower.castShadow = true;
    bGroup.add(lower);

    // Torso / Waist
    const waistGeo = registerGeom(new THREE.CylinderGeometry(0.26, 0.28, 0.4, 16));
    const waist = new THREE.Mesh(waistGeo, dhotiMat);
    waist.position.y = 1.25;
    bGroup.add(waist);

    const chestGeo = registerGeom(new THREE.CylinderGeometry(0.28, 0.24, 0.55, 16));
    const chest = new THREE.Mesh(chestGeo, skinMat);
    chest.position.y = 1.65;
    chest.castShadow = true;
    bGroup.add(chest);

    // Golden necklace
    const neckRing = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.22, 0.03, 8, 16)), mats.goldOrnaments);
    neckRing.rotation.x = Math.PI / 2.2;
    neckRing.position.set(0, 1.88, 0.05);
    bGroup.add(neckRing);

    return bGroup;
  }

  function createDeityCrown(headGroup, yPos = 2.45, height = 0.45) {
    const cGeo = registerGeom(new THREE.ConeGeometry(0.24, height, 16));
    const crown = new THREE.Mesh(cGeo, mats.goldOrnaments);
    crown.position.y = yPos;
    headGroup.add(crown);

    const cBase = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.22, 0.2, 0.12, 16)), mats.goldOrnaments);
    cBase.position.y = yPos - height / 2;
    headGroup.add(cBase);

    // Crown halo disc
    const halo = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 24)), mats.goldOrnaments);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, yPos - 0.1, -0.1);
    headGroup.add(halo);
  }

  // ==========================================
  // 1. LORD GANESHA (Far Left, x = -3.8m)
  // ==========================================
  const ganesha = new THREE.Group();
  ganesha.position.set(-3.8, 0, 0);

  // Body: Pot-bellied with saffron dhoti
  const gBody = new THREE.Group();
  const gDhoti = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.38, 0.5, 0.95, 16)), mats.ganeshaDhoti);
  gDhoti.position.y = 0.48;
  gBody.add(gDhoti);

  // Pot belly (Lambodara)
  const belly = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.38, 16, 16)), mats.ganeshaSkin);
  belly.position.set(0, 1.1, 0.12);
  gBody.add(belly);

  const gChest = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.34, 0.36, 0.5, 16)), mats.ganeshaSkin);
  gChest.position.y = 1.45;
  gBody.add(gChest);

  // Sacred thread (Upavita)
  const thread = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.36, 0.02, 6, 20)), mats.whiteSwan);
  thread.rotation.z = Math.PI / 4;
  thread.position.set(0, 1.35, 0.08);
  gBody.add(thread);
  ganesha.add(gBody);

  // Elephant Head
  const gHead = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.3, 16, 16)), mats.ganeshaSkin);
  gHead.position.set(0, 1.88, 0.08);
  ganesha.add(gHead);

  // Curved Trunk (Shundo)
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.9, 0.28),
    new THREE.Vector3(0.04, 1.65, 0.38),
    new THREE.Vector3(0.12, 1.45, 0.42),
    new THREE.Vector3(0.24, 1.42, 0.38), // Curved left holding modak
  ]);
  const trunkGeo = registerGeom(new THREE.TubeGeometry(trunkCurve, 20, 0.09, 8, false));
  const trunk = new THREE.Mesh(trunkGeo, mats.ganeshaSkin);
  ganesha.add(trunk);

  // Large Elephant Ears (Karno)
  for (const side of [-1, 1]) {
    const earGeo = registerGeom(new THREE.BoxGeometry(0.35, 0.42, 0.04));
    const ear = new THREE.Mesh(earGeo, mats.ganeshaSkin);
    ear.position.set(side * 0.38, 1.9, 0.02);
    ear.rotation.y = side * 0.3;
    ganesha.add(ear);
  }

  // Single White Tusk
  const tusk = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.035, 0.2, 8)), mats.silverOrnaments);
  tusk.rotation.x = Math.PI / 2.5;
  tusk.position.set(0.12, 1.76, 0.3);
  ganesha.add(tusk);

  createDeityCrown(ganesha, 2.35, 0.45);

  // Arms holding modak and axe
  const gArmL = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8)), mats.ganeshaSkin);
  gArmL.position.set(0.35, 1.45, 0.22);
  gArmL.rotation.set(0.5, 0, -0.4);
  ganesha.add(gArmL);

  // Modak bowl
  const bowl = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.12, 8, 8)), mats.goldOrnaments);
  bowl.position.set(0.38, 1.4, 0.4);
  ganesha.add(bowl);

  // Vahana: Mushika (Mouse at base)
  const mouse = new THREE.Group();
  mouse.position.set(0, 0.1, 0.45);
  const mBody = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.14, 12, 12)), mats.mouseGrey);
  mBody.scale.set(1, 0.8, 1.6);
  mouse.add(mBody);
  const mHead = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.08, 0.16, 8)), mats.mouseGrey);
  mHead.rotation.x = -Math.PI / 2;
  mHead.position.set(0, 0.02, 0.22);
  mouse.add(mHead);
  ganesha.add(mouse);

  group.add(ganesha);

  // ==========================================
  // 2. GODDESS LAKSHMI (Mid Left, x = -2.0m)
  // ==========================================
  const lakshmi = new THREE.Group();
  lakshmi.position.set(-2.0, 0, 0);

  const lBody = createBasicDeityBody(mats.lakshmiSaree, mats.divineSkin);
  lakshmi.add(lBody);

  // Saree Pallu across shoulder
  const lPallu = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.18, 0.75, 0.08)), mats.lakshmiSaree);
  lPallu.position.set(-0.12, 1.55, 0.18);
  lPallu.rotation.z = -0.3;
  lakshmi.add(lPallu);

  // Head with painted face & crown
  const lHead = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.22, 16, 16)), mats.durgaFace);
  lHead.position.set(0, 2.05, 0.05);
  lHead.rotation.y = -Math.PI / 2;
  lakshmi.add(lHead);

  createDeityCrown(lakshmi, 2.45, 0.42);

  // Arms holding pink lotus blossoms (Padma)
  for (const side of [-1, 1]) {
    const lArm = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.065, 0.055, 0.52, 8)), mats.divineSkin);
    lArm.position.set(side * 0.32, 1.55, 0.15);
    lArm.rotation.set(0.4, 0, side * 0.25);
    lakshmi.add(lArm);

    const lotus = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.1, 8, 8)), mats.sacredLotus);
    lotus.position.set(side * 0.35, 1.78, 0.32);
    lakshmi.add(lotus);
  }

  // Vahana: Owl (Pecha at base)
  const owl = new THREE.Group();
  owl.position.set(0, 0.22, 0.45);
  const oBody = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 10)), mats.owlBrown);
  owl.add(oBody);
  const oHead = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.14, 10, 10)), mats.owlBrown);
  oHead.position.y = 0.24;
  owl.add(oHead);
  // Large yellow owl eyes
  for (const s of [-0.06, 0.06]) {
    const oEye = new THREE.Mesh(registerGeom(new THREE.CircleGeometry(0.04, 8)), mats.goldOrnaments);
    oEye.position.set(s, 0.26, 0.14);
    owl.add(oEye);
  }
  lakshmi.add(owl);

  group.add(lakshmi);

  // ==========================================
  // 3. GODDESS SARASWATI (Mid Right, x = +2.0m)
  // ==========================================
  const saraswati = new THREE.Group();
  saraswati.position.set(2.0, 0, 0);

  const sBody = createBasicDeityBody(mats.saraswatiSaree, mats.divineSkin);
  saraswati.add(sBody);

  const sPallu = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.18, 0.75, 0.08)), mats.saraswatiSaree);
  sPallu.position.set(0.12, 1.55, 0.18);
  sPallu.rotation.z = 0.3;
  saraswati.add(sPallu);

  // Head with crown
  const sHead = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.22, 16, 16)), mats.durgaFace);
  sHead.position.set(0, 2.05, 0.05);
  sHead.rotation.y = -Math.PI / 2;
  saraswati.add(sHead);

  createDeityCrown(saraswati, 2.45, 0.42);

  // Arms gracefully holding the Sacred Veena (String instrument)
  const sArmL = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.065, 0.055, 0.5, 8)), mats.divineSkin);
  sArmL.position.set(-0.25, 1.55, 0.2);
  sArmL.rotation.set(0.5, 0, -0.4);
  saraswati.add(sArmL);

  const sArmR = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.065, 0.055, 0.5, 8)), mats.divineSkin);
  sArmR.position.set(0.25, 1.5, 0.2);
  sArmR.rotation.set(0.4, 0, 0.5);
  saraswati.add(sArmR);

  // The Veena
  const veena = new THREE.Group();
  veena.position.set(0, 1.5, 0.3);
  veena.rotation.z = -Math.PI / 3.5;
  const vNeck = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 8)), mats.sacredVeena);
  veena.add(vNeck);
  const vGourd1 = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.18, 12, 12)), mats.sacredVeena);
  vGourd1.position.y = -0.55;
  veena.add(vGourd1);
  const vGourd2 = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.13, 10, 10)), mats.sacredVeena);
  vGourd2.position.y = 0.5;
  veena.add(vGourd2);
  saraswati.add(veena);

  // Vahana: White Swan (Hamsa at base)
  const swan = new THREE.Group();
  swan.position.set(0, 0.2, 0.45);
  const swBody = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.18, 12, 12)), mats.whiteSwan);
  swBody.scale.set(1, 0.8, 1.4);
  swan.add(swBody);
  const swNeck = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 8)), mats.whiteSwan);
  swNeck.position.set(0, 0.2, 0.15);
  swNeck.rotation.x = -0.3;
  swan.add(swNeck);
  const swHead = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.06, 0.14, 8)), mats.whiteSwan);
  swHead.rotation.x = Math.PI / 2;
  swHead.position.set(0, 0.34, 0.25);
  swan.add(swHead);
  saraswati.add(swan);

  group.add(saraswati);

  // ==========================================
  // 4. LORD KARTIKEYA (Far Right, x = +3.8m)
  // ==========================================
  const kartikeya = new THREE.Group();
  kartikeya.position.set(3.8, 0, 0);

  // Royal blue dhoti and warrior prince torso
  const kBody = createBasicDeityBody(mats.kartikeyaDhoti, mats.divineSkin);
  kartikeya.add(kBody);

  // Head with crown
  const kHead = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.22, 16, 16)), mats.durgaFace);
  kHead.position.set(0, 2.05, 0.05);
  kHead.rotation.y = -Math.PI / 2;
  kartikeya.add(kHead);

  createDeityCrown(kartikeya, 2.45, 0.45);

  // Arms holding golden bow and warrior spear (Vel / Shaktayudha)
  const kArmL = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.07, 0.06, 0.52, 8)), mats.divineSkin);
  kArmL.position.set(-0.32, 1.55, 0.15);
  kArmL.rotation.set(0.3, 0, -0.3);
  kartikeya.add(kArmL);

  // Golden Spear / Vel
  const spear = new THREE.Group();
  spear.position.set(-0.35, 1.5, 0.2);
  const sShaft = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 8)), mats.weaponGold);
  spear.add(sShaft);
  const spearHead = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.08, 0.35, 8)), mats.weaponSteel);
  spearHead.position.y = 1.15;
  spear.add(spearHead);
  kartikeya.add(spear);

  const kArmR = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.07, 0.06, 0.52, 8)), mats.divineSkin);
  kArmR.position.set(0.32, 1.55, 0.15);
  kArmR.rotation.set(0.2, 0, 0.3);
  kartikeya.add(kArmR);

  // Golden bow (Dhanush)
  const kBow = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.48, 0.025, 6, 16, Math.PI / 1.4)), mats.weaponGold);
  kBow.rotation.z = Math.PI / 3;
  kBow.position.set(0.35, 1.5, 0.2);
  kartikeya.add(kBow);

  // Vahana: Royal Peacock (Mayura at base with fan tail)
  const peacock = new THREE.Group();
  peacock.position.set(0, 0.25, 0.4);
  const pBody = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.18, 12, 12)), mats.royalPeacock);
  pBody.scale.set(1, 0.8, 1.4);
  peacock.add(pBody);
  const pNeck = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.05, 0.06, 0.38, 8)), mats.royalPeacock);
  pNeck.position.set(0, 0.22, 0.18);
  pNeck.rotation.x = -0.2;
  peacock.add(pNeck);

  // Fan tail plumage behind the peacock
  const pTail = new THREE.Mesh(registerGeom(new THREE.CircleGeometry(0.55, 16, 0, Math.PI)), mats.peacockFeather);
  pTail.position.set(0, 0.35, -0.2);
  peacock.add(pTail);
  kartikeya.add(peacock);

  group.add(kartikeya);

  return group;
}
