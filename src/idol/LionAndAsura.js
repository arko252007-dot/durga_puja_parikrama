import * as THREE from 'three';

/**
 * Creates the sculptured 3D Lion (Singha Vahana) and Mahishasura (Buffalo Demon).
 * Flanks Maa Durga cleanly: Lion on her right (x = -1.2m), Demon on her left (x = +0.85m).
 * 
 * @param {object} mats Materials collection from IdolMaterials
 * @param {function} registerGeom Helper to track geometries for disposal
 * @returns {THREE.Group}
 */
export function createLionAndAsura(mats, registerGeom) {
  const group = new THREE.Group();
  group.name = 'LionAndAsuraGroup';

  // ==========================================
  // 1. THE LION (SINGHA VAHANA) - To the right of Durga (x = -1.25m)
  // Facing diagonally forward-inward toward Mahishasura
  // ==========================================
  const lion = new THREE.Group();
  lion.position.set(-1.25, 0, 0.05);
  lion.rotation.y = Math.PI / 3.5;

  // Lion Body (muscular feline torso)
  const bodyGeo = registerGeom(new THREE.CylinderGeometry(0.3, 0.36, 1.1, 16));
  const lionBody = new THREE.Mesh(bodyGeo, mats.lionFur);
  lionBody.rotation.x = Math.PI / 2.1;
  lionBody.position.set(0, 0.55, 0);
  lionBody.castShadow = true;
  lionBody.receiveShadow = true;
  lion.add(lionBody);

  // Chest / Shoulder
  const chestGeo = registerGeom(new THREE.SphereGeometry(0.38, 16, 16));
  const lionChest = new THREE.Mesh(chestGeo, mats.lionFur);
  lionChest.position.set(0, 0.65, 0.4);
  lionChest.castShadow = true;
  lion.add(lionChest);

  // Lion Legs & Paws
  function createLionLeg(x, y, z, rotX, rotZ) {
    const leg = new THREE.Group();
    leg.position.set(x, y, z);
    const upperGeo = registerGeom(new THREE.CylinderGeometry(0.12, 0.1, 0.45, 12));
    const upper = new THREE.Mesh(upperGeo, mats.lionFur);
    upper.position.y = -0.22;
    leg.add(upper);

    const pawGeo = registerGeom(new THREE.BoxGeometry(0.2, 0.12, 0.26));
    const paw = new THREE.Mesh(pawGeo, mats.lionFur);
    paw.position.set(0, -0.45, 0.06);
    leg.add(paw);

    // Claws
    for (let c = -1; c <= 1; c++) {
      const clawGeo = registerGeom(new THREE.ConeGeometry(0.02, 0.07, 8));
      const claw = new THREE.Mesh(clawGeo, mats.weaponSteel);
      claw.rotation.x = Math.PI / 2;
      claw.position.set(c * 0.06, -0.45, 0.2);
      leg.add(claw);
    }

    leg.rotation.x = rotX;
    leg.rotation.z = rotZ;
    return leg;
  }

  // Front paws attacking inward
  lion.add(createLionLeg(0.26, 0.65, 0.5, -0.2, -0.15));
  lion.add(createLionLeg(-0.26, 0.65, 0.4, 0.1, 0.1));
  // Hind paws
  lion.add(createLionLeg(0.25, 0.5, -0.4, 0.15, 0));
  lion.add(createLionLeg(-0.25, 0.5, -0.4, 0.1, 0));

  // Voluminous Golden Lion Mane
  const maneGeo = registerGeom(new THREE.SphereGeometry(0.42, 16, 16));
  const lionMane = new THREE.Mesh(maneGeo, mats.lionMane);
  lionMane.scale.set(1.1, 1.2, 1.0);
  lionMane.position.set(0, 0.95, 0.55);
  lionMane.castShadow = true;
  lion.add(lionMane);

  // Lion Head & Snout
  const headGeo = registerGeom(new THREE.SphereGeometry(0.26, 16, 16));
  const lionHead = new THREE.Mesh(headGeo, mats.lionFur);
  lionHead.position.set(0, 1.05, 0.82);
  lionHead.castShadow = true;
  lion.add(lionHead);

  // Snout & Open Jaws
  const snoutGeo = registerGeom(new THREE.BoxGeometry(0.25, 0.18, 0.28));
  const lionSnout = new THREE.Mesh(snoutGeo, mats.lionFur);
  lionSnout.position.set(0, 0.98, 1.02);
  lion.add(lionSnout);

  // Fangs
  const fangGeo = registerGeom(new THREE.ConeGeometry(0.025, 0.08, 8));
  const fangL = new THREE.Mesh(fangGeo, mats.silverOrnaments);
  fangL.rotation.x = Math.PI;
  fangL.position.set(-0.07, 1.0, 1.12);
  lion.add(fangL);
  const fangR = new THREE.Mesh(fangGeo, mats.silverOrnaments);
  fangR.rotation.x = Math.PI;
  fangR.position.set(0.07, 1.0, 1.12);
  lion.add(fangR);

  // Ears
  const earGeo = registerGeom(new THREE.ConeGeometry(0.07, 0.14, 8));
  const earL = new THREE.Mesh(earGeo, mats.lionFur);
  earL.position.set(-0.2, 1.3, 0.76);
  lion.add(earL);
  const earR = new THREE.Mesh(earGeo, mats.lionFur);
  earR.position.set(0.2, 1.3, 0.76);
  lion.add(earR);

  // Curved Tail
  const tailGeo = registerGeom(new THREE.CylinderGeometry(0.035, 0.045, 0.8, 8));
  const tail = new THREE.Mesh(tailGeo, mats.lionFur);
  tail.rotation.x = -Math.PI / 3;
  tail.position.set(0, 0.65, -0.55);
  lion.add(tail);

  const tailTuft = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.1, 8, 8)), mats.lionMane);
  tailTuft.position.set(0, 1.0, -0.75);
  lion.add(tailTuft);

  group.add(lion);

  // ==========================================
  // 2. THE BUFFALO (MAHISHA) - Base below demon (x = 0.85m)
  // ==========================================
  const buffalo = new THREE.Group();
  buffalo.position.set(0.85, 0, 0.1);

  // Recumbent buffalo torso
  const bTorsoGeo = registerGeom(new THREE.CylinderGeometry(0.36, 0.42, 1.0, 12));
  const bTorso = new THREE.Mesh(bTorsoGeo, mats.buffaloSkin);
  bTorso.rotation.x = Math.PI / 2;
  bTorso.position.set(0, 0.3, -0.2);
  bTorso.castShadow = true;
  buffalo.add(bTorso);

  // Buffalo head resting on pedestal
  const bHeadGeo = registerGeom(new THREE.ConeGeometry(0.26, 0.6, 12));
  const bHead = new THREE.Mesh(bHeadGeo, mats.buffaloSkin);
  bHead.rotation.x = -Math.PI / 2.3;
  bHead.position.set(0.1, 0.2, 0.6);
  bHead.castShadow = true;
  buffalo.add(bHead);

  // Curved dark buffalo horns
  const hornGeo = registerGeom(new THREE.TorusGeometry(0.36, 0.07, 8, 16, Math.PI / 1.5));
  const hornL = new THREE.Mesh(hornGeo, mats.buffaloSkin);
  hornL.rotation.y = -Math.PI / 3;
  hornL.rotation.z = Math.PI / 3;
  hornL.position.set(-0.2, 0.35, 0.55);
  buffalo.add(hornL);

  const hornR = new THREE.Mesh(hornGeo, mats.buffaloSkin);
  hornR.rotation.y = Math.PI / 3;
  hornR.rotation.z = -Math.PI / 3;
  hornR.position.set(0.3, 0.35, 0.55);
  buffalo.add(hornR);

  group.add(buffalo);

  // ==========================================
  // 3. MAHISHASURA (THE DEMON WARRIOR) - (x = 0.85m, y = 0.4m)
  // ==========================================
  const asura = new THREE.Group();
  asura.position.set(0.85, 0.38, 0.2);
  asura.rotation.y = -Math.PI / 4.5; // Angled facing Durga

  // Muscular green demon torso
  const aTorsoGeo = registerGeom(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 16));
  const aTorso = new THREE.Mesh(aTorsoGeo, mats.asuraSkin);
  aTorso.position.set(0, 0.42, 0);
  aTorso.rotation.x = -0.15;
  aTorso.castShadow = true;
  asura.add(aTorso);

  // Pectorals
  const pecGeo = registerGeom(new THREE.BoxGeometry(0.46, 0.28, 0.24));
  const aChest = new THREE.Mesh(pecGeo, mats.asuraSkin);
  aChest.position.set(0, 0.58, 0.08);
  aChest.rotation.x = -0.15;
  asura.add(aChest);

  // Demon waist & dhoti
  const aDhotiGeo = registerGeom(new THREE.CylinderGeometry(0.26, 0.32, 0.4, 16));
  const aDhoti = new THREE.Mesh(aDhotiGeo, mats.asuraDhoti);
  aDhoti.position.set(0, 0.12, -0.02);
  asura.add(aDhoti);

  // Gold belt
  const aBelt = new THREE.Mesh(registerGeom(new THREE.TorusGeometry(0.28, 0.04, 8, 16)), mats.goldOrnaments);
  aBelt.rotation.x = Math.PI / 2;
  aBelt.position.set(0, 0.25, 0);
  asura.add(aBelt);

  // Demon Head
  const aHeadGeo = registerGeom(new THREE.SphereGeometry(0.22, 16, 16));
  const aHead = new THREE.Mesh(aHeadGeo, mats.asuraSkin);
  aHead.position.set(0, 1.0, -0.02);
  aHead.castShadow = true;
  asura.add(aHead);

  // Demon Crown
  const aCrown = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.2, 0.36, 12)), mats.goldOrnaments);
  aCrown.position.set(0, 1.25, -0.04);
  asura.add(aCrown);

  // Demon Horns
  for (const s of [-1, 1]) {
    const aHorn = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.05, 0.25, 8)), mats.silverOrnaments);
    aHorn.rotation.z = s * (Math.PI / 3.8);
    aHorn.position.set(s * 0.19, 1.18, 0);
    asura.add(aHorn);
  }

  // Demon Mustache
  const mustache = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.24, 0.045, 0.07)), mats.buffaloSkin);
  mustache.position.set(0, 0.94, 0.18);
  asura.add(mustache);

  // Demon Arms
  // Right arm raised with curved sword
  const aArmR = new THREE.Group();
  aArmR.position.set(0.32, 0.65, 0);
  const aUpperR = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.09, 0.08, 0.38, 10)), mats.asuraSkin);
  aUpperR.rotation.z = -Math.PI / 3.2;
  aUpperR.position.set(0.15, 0.08, 0);
  aArmR.add(aUpperR);

  const aForeR = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 10)), mats.asuraSkin);
  aForeR.position.set(0.32, 0.3, 0);
  aArmR.add(aForeR);

  const aSword = new THREE.Mesh(registerGeom(new THREE.BoxGeometry(0.07, 0.72, 0.025)), mats.weaponSteel);
  aSword.position.set(0.35, 0.68, 0);
  aSword.rotation.z = 0.18;
  aArmR.add(aSword);
  asura.add(aArmR);

  // Left arm with shield
  const aArmL = new THREE.Group();
  aArmL.position.set(-0.32, 0.65, 0);
  const aUpperL = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.09, 0.08, 0.38, 10)), mats.asuraSkin);
  aUpperL.rotation.z = Math.PI / 4;
  aUpperL.position.set(-0.14, 0.05, 0.1);
  aArmL.add(aUpperL);

  const aShield = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16)), mats.weaponSteel);
  aShield.rotation.x = Math.PI / 2;
  aShield.position.set(-0.3, 0.12, 0.28);
  aArmL.add(aShield);
  asura.add(aArmL);

  // Serpent coiling around the demon
  const snakeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 0.25, 0.18),
    new THREE.Vector3(-0.08, 0.48, 0.26),
    new THREE.Vector3(0.28, 0.58, 0.08),
    new THREE.Vector3(0.15, 0.75, -0.15),
    new THREE.Vector3(-0.2, 0.85, 0.08),
    new THREE.Vector3(-0.08, 1.05, 0.2),
  ]);
  const snakeGeo = registerGeom(new THREE.TubeGeometry(snakeCurve, 24, 0.04, 8, false));
  const snakeMesh = new THREE.Mesh(snakeGeo, mats.peacockFeather);
  asura.add(snakeMesh);

  group.add(asura);

  return group;
}
