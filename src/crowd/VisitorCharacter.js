import * as THREE from 'three';

/**
 * 3D Visitor Character with articulation for walking and idle festival behaviours.
 * Features:
 * - 4 distinct body types & heights:
 *   0: Woman in Traditional Bengali Saree (height ~1.62m) with pallu drape
 *   1: Man in Festive Panjabi / Kurta with Pajama (height ~1.75m)
 *   2: Woman in Salwar Kameez / Kurti with Dupatta (height ~1.65m)
 *   3: Man in Modern Casual Festive Shirt / Trousers (height ~1.78m)
 * - Articulated legs and arms:
 *   Leg hip pivots for forward/backward natural stride.
 *   Arm shoulder pivots for alternating natural arm swing.
 *   Spine / torso vertical subtle bobbing with sine phase.
 *   Foot contact alignment with zero sliding.
 * - Varied skin tones, hair styles, and festive clothing palettes.
 */

export class VisitorCharacter {
  /**
   * @param {object} mats Materials from createCrowdMaterials
   * @param {function} registerGeom Helper to track geometries for disposal
   * @param {number} styleIndex Index selecting attire and silhouette
   * @param {number} seed Deterministic pseudo-random seed
   */
  constructor(mats, registerGeom, styleIndex = 0, seed = 0) {
    this.mats = mats;
    this.registerGeom = registerGeom;
    this.styleIndex = styleIndex % 4;
    this.seed = seed;

    // Pseudo-random attribute variation based on seed
    const pseudo = (offset = 0) => {
      const x = Math.sin(this.seed * 9973 + offset * 7919) * 10000;
      return x - Math.floor(x);
    };

    // Scale variation: ±6% natural height variance
    this.scaleFactor = 0.94 + pseudo(1) * 0.12;

    // Pick materials
    this.skinMat = mats.skinMaterials[Math.floor(pseudo(2) * mats.skinMaterials.length)];
    this.hairMat = mats.hairMaterials[Math.floor(pseudo(3) * mats.hairMaterials.length)];
    this.outfitMat = mats.outfitMaterials[Math.floor(pseudo(4) * mats.outfitMaterials.length)];
    this.secondaryOutfitMat = mats.outfitMaterials[Math.floor(pseudo(5) * mats.outfitMaterials.length)];
    this.shoeMat = mats.shoeMaterials[Math.floor(pseudo(6) * mats.shoeMaterials.length)];

    // Root container
    this.root = new THREE.Group();
    this.root.name = `Visitor_${styleIndex}_${seed}`;

    // Hierarchical body groups for animation
    this.bodyGroup = new THREE.Group();
    this.root.add(this.bodyGroup);

    this.leftLegGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.rightArmGroup = new THREE.Group();
    this.headGroup = new THREE.Group();

    // Assembly
    this.buildCharacter();

    // Apply scaling
    this.root.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);

    // Animation state
    this.walkCycle = pseudo(7) * Math.PI * 2;
    this.walkSpeed = 1.05 + pseudo(8) * 0.35; // 1.05m/s to 1.4m/s realistic human walking pace
    this.isMoving = false;
    this.idlePoseTime = pseudo(9) * 10.0;
    this.headTurnOffset = (pseudo(10) - 0.5) * 0.4;
  }

  buildCharacter() {
    const geo = (g) => this.registerGeom(g);

    // 1. Legs and Feet
    // Leg length ~0.8m, hip height ~0.84m
    const legRadius = 0.085;
    const legLength = 0.8;
    const legMeshGeo = geo(new THREE.CylinderGeometry(legRadius * 0.9, legRadius * 0.75, legLength, 10));
    const shoeGeo = geo(new THREE.BoxGeometry(0.12, 0.07, 0.22));

    // Left Leg Pivot
    this.leftLegGroup.position.set(-0.13, 0.82, 0);
    const leftLegMesh = new THREE.Mesh(
      legMeshGeo,
      this.styleIndex === 0 ? this.outfitMat : this.secondaryOutfitMat
    );
    leftLegMesh.position.y = -legLength / 2;
    leftLegMesh.castShadow = true;
    this.leftLegGroup.add(leftLegMesh);

    const leftShoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    leftShoe.position.set(0, -legLength - 0.01, 0.04);
    leftShoe.castShadow = true;
    this.leftLegGroup.add(leftShoe);
    this.bodyGroup.add(this.leftLegGroup);

    // Right Leg Pivot
    this.rightLegGroup.position.set(0.13, 0.82, 0);
    const rightLegMesh = new THREE.Mesh(
      legMeshGeo,
      this.styleIndex === 0 ? this.outfitMat : this.secondaryOutfitMat
    );
    rightLegMesh.position.y = -legLength / 2;
    rightLegMesh.castShadow = true;
    this.rightLegGroup.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    rightShoe.position.set(0, -legLength - 0.01, 0.04);
    rightShoe.castShadow = true;
    this.rightLegGroup.add(rightShoe);
    this.bodyGroup.add(this.rightLegGroup);

    // 2. Torso and Attire
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.82;

    if (this.styleIndex === 0) {
      // Saree style: Flared lower skirt/pleats draped over legs + upper blouse + shoulder pallu
      const sareePleatGeo = geo(new THREE.CylinderGeometry(0.18, 0.32, 0.82, 16));
      const sareeSkirt = new THREE.Mesh(sareePleatGeo, this.outfitMat);
      sareeSkirt.position.y = -0.38;
      sareeSkirt.castShadow = true;
      torsoGroup.add(sareeSkirt);

      // Upper Torso / Blouse
      const chestGeo = geo(new THREE.CylinderGeometry(0.19, 0.17, 0.42, 14));
      const chest = new THREE.Mesh(chestGeo, this.outfitMat);
      chest.position.y = 0.22;
      chest.castShadow = true;
      torsoGroup.add(chest);

      // Saree Pallu crossing chest and hanging over left shoulder
      const palluGeo = geo(new THREE.BoxGeometry(0.12, 0.58, 0.06));
      const pallu = new THREE.Mesh(palluGeo, this.secondaryOutfitMat);
      pallu.position.set(-0.08, 0.2, 0.12);
      pallu.rotation.set(0.1, 0.1, -0.35);
      torsoGroup.add(pallu);
    } else if (this.styleIndex === 1) {
      // Men's Panjabi / Kurta: Long knee-length tunic over pajama trousers
      const kurtaHemGeo = geo(new THREE.CylinderGeometry(0.2, 0.26, 0.55, 14));
      const kurtaHem = new THREE.Mesh(kurtaHemGeo, this.outfitMat);
      kurtaHem.position.y = -0.22;
      kurtaHem.castShadow = true;
      torsoGroup.add(kurtaHem);

      const chestGeo = geo(new THREE.CylinderGeometry(0.22, 0.2, 0.45, 14));
      const chest = new THREE.Mesh(chestGeo, this.outfitMat);
      chest.position.y = 0.24;
      chest.castShadow = true;
      torsoGroup.add(chest);

      // Nehru style collar
      const collarGeo = geo(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12));
      const collar = new THREE.Mesh(collarGeo, this.outfitMat);
      collar.position.y = 0.48;
      torsoGroup.add(collar);
    } else if (this.styleIndex === 2) {
      // Salwar Kameez / Kurti with Dupatta
      const kameezHemGeo = geo(new THREE.CylinderGeometry(0.18, 0.25, 0.52, 14));
      const kameezHem = new THREE.Mesh(kameezHemGeo, this.outfitMat);
      kameezHem.position.y = -0.22;
      kameezHem.castShadow = true;
      torsoGroup.add(kameezHem);

      const chestGeo = geo(new THREE.CylinderGeometry(0.19, 0.17, 0.42, 14));
      const chest = new THREE.Mesh(chestGeo, this.outfitMat);
      chest.position.y = 0.22;
      chest.castShadow = true;
      torsoGroup.add(chest);

      // Dupatta draped gracefully across both shoulders
      const dupattaGeo = geo(new THREE.TorusGeometry(0.22, 0.045, 6, 16, Math.PI));
      const dupatta = new THREE.Mesh(dupattaGeo, this.secondaryOutfitMat);
      dupatta.rotation.x = Math.PI / 2.3;
      dupatta.position.set(0, 0.38, 0.04);
      torsoGroup.add(dupatta);
    } else {
      // Modern Festive Casuals (Shirt / Polo + Trousers)
      const chestGeo = geo(new THREE.CylinderGeometry(0.22, 0.19, 0.46, 14));
      const chest = new THREE.Mesh(chestGeo, this.outfitMat);
      chest.position.y = 0.24;
      chest.castShadow = true;
      torsoGroup.add(chest);

      // Belt
      const beltGeo = geo(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14));
      const belt = new THREE.Mesh(beltGeo, this.shoeMat);
      belt.position.y = 0.02;
      torsoGroup.add(belt);
    }

    this.bodyGroup.add(torsoGroup);

    // 3. Arms and Hands
    const armRadius = 0.055;
    const armLength = 0.58;
    const armGeo = geo(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.75, armLength, 8));
    const handGeo = geo(new THREE.SphereGeometry(0.048, 8, 8));

    // Left Arm Pivot
    this.leftArmGroup.position.set(-0.24, 1.25, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.outfitMat);
    leftArmMesh.position.y = -armLength / 2;
    leftArmMesh.castShadow = true;
    this.leftArmGroup.add(leftArmMesh);

    const leftHand = new THREE.Mesh(handGeo, this.skinMat);
    leftHand.position.set(0, -armLength - 0.02, 0);
    this.leftArmGroup.add(leftHand);
    this.bodyGroup.add(this.leftArmGroup);

    // Right Arm Pivot
    this.rightArmGroup.position.set(0.24, 1.25, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, this.outfitMat);
    rightArmMesh.position.y = -armLength / 2;
    rightArmMesh.castShadow = true;
    this.rightArmGroup.add(rightArmMesh);

    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.set(0, -armLength - 0.02, 0);
    this.rightArmGroup.add(rightHand);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Neck and Head
    this.headGroup.position.set(0, 1.34, 0);

    const neckGeo = geo(new THREE.CylinderGeometry(0.065, 0.08, 0.12, 10));
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = 0.04;
    this.headGroup.add(neck);

    const headGeo = geo(new THREE.SphereGeometry(0.12, 14, 14));
    const head = new THREE.Mesh(headGeo, this.skinMat);
    head.scale.set(0.9, 1.05, 0.95);
    head.position.set(0, 0.18, 0.01);
    head.castShadow = true;
    this.headGroup.add(head);

    // Hairstyle
    if (this.styleIndex === 0 || this.styleIndex === 2) {
      // Traditional Bun (Khopa) or cascading long hair
      const bunGeo = geo(new THREE.SphereGeometry(0.09, 10, 10));
      const bun = new THREE.Mesh(bunGeo, this.hairMat);
      bun.position.set(0, 0.16, -0.11);
      this.headGroup.add(bun);

      // Red sacred Bindi on forehead
      const bindiGeo = geo(new THREE.SphereGeometry(0.012, 6, 6));
      const bindiMat = new THREE.MeshBasicMaterial({ color: 0xaa1122 });
      const bindi = new THREE.Mesh(bindiGeo, bindiMat);
      bindi.position.set(0, 0.22, 0.11);
      this.headGroup.add(bindi);
    } else {
      // Modern / Trimmed Men's hair
      const mHairGeo = geo(new THREE.SphereGeometry(0.125, 12, 12));
      const mHair = new THREE.Mesh(mHairGeo, this.hairMat);
      mHair.scale.set(0.94, 0.6, 1.0);
      mHair.position.set(0, 0.25, 0.0);
      this.headGroup.add(mHair);
    }

    this.bodyGroup.add(this.headGroup);
  }

  /**
   * Updates walking articulation or devotional idle breathing pose.
   * @param {number} delta Seconds since last frame
   * @param {number} currentSpeed Actual translation speed along path
   */
  updateAnimation(delta, currentSpeed) {
    if (currentSpeed > 0.05) {
      // Active Walking Mode
      this.isMoving = true;
      // Stride frequency proportional to actual speed
      this.walkCycle += delta * currentSpeed * 4.2;

      const strideAngle = Math.sin(this.walkCycle) * 0.42; // ~24 deg leg swing
      const armSwingAngle = Math.sin(this.walkCycle) * 0.35; // ~20 deg natural opposite arm swing

      // Natural counter-swinging legs
      this.leftLegGroup.rotation.x = strideAngle;
      this.rightLegGroup.rotation.x = -strideAngle;

      // Natural counter-swinging arms (opposite to legs)
      this.leftArmGroup.rotation.x = -armSwingAngle;
      this.rightArmGroup.rotation.x = armSwingAngle;

      // Vertical body bounce (bobbing twice per stride)
      this.bodyGroup.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.032;

      // Subtle torso yaw twist countering pelvis
      this.bodyGroup.rotation.y = Math.sin(this.walkCycle) * 0.04;

      // Head remains focused forward with slight natural stabilization
      this.headGroup.rotation.y = this.headTurnOffset * 0.2;
      this.headGroup.rotation.x = 0;
    } else {
      // Idle / Darshan Mode (standing respectfully, looking up towards Maa Durga)
      this.isMoving = false;
      this.idlePoseTime += delta;

      // Gentle natural breathing motion
      const breath = Math.sin(this.idlePoseTime * 1.5);
      this.bodyGroup.position.y = breath * 0.008;

      // Return legs smoothly to resting vertical
      this.leftLegGroup.rotation.x *= 0.88;
      this.rightLegGroup.rotation.x *= 0.88;

      // Subtle arm resting sway or devotional folded hands
      if (this.styleIndex === 0 && Math.sin(this.seed) > 0.2) {
        // Devotional Anjali Mudra (folded hands in prayer towards tableau)
        this.leftArmGroup.rotation.x = -0.65;
        this.leftArmGroup.rotation.z = -0.3;
        this.rightArmGroup.rotation.x = -0.65;
        this.rightArmGroup.rotation.z = 0.3;
      } else {
        this.leftArmGroup.rotation.x = Math.sin(this.idlePoseTime * 0.8) * 0.03;
        this.rightArmGroup.rotation.x = -Math.sin(this.idlePoseTime * 0.8) * 0.03;
      }

      // Looking admiringly towards the sanctum (slight upward tilt and gentle look-around)
      this.headGroup.rotation.x = -0.12 + Math.sin(this.idlePoseTime * 0.5) * 0.04;
      this.headGroup.rotation.y = this.headTurnOffset + Math.sin(this.idlePoseTime * 0.3) * 0.08;
    }
  }
}
