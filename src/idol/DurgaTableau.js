import * as THREE from 'three';
import { createIdolMaterials } from './IdolMaterials.js';
import { createDurgaFigure } from './DurgaFigure.js';
import { createLionAndAsura } from './LionAndAsura.js';
import { createSupportingDeities } from './SupportingDeities.js';

/**
 * Master module for Maa Durga Pratima and the complete Bengali Puja Tableau.
 * 
 * Accurately aligns with Phase 3 interior dais:
 * - Positioned at x = 0, Z = -39.0m, y = 1.45m (top surface of Tier 3 altar dais).
 * - Width spans ~9.6m across the 10m dais, depth ~2.8m.
 * - Pyramidal composition: Central Maa Durga (~4.4m tall) flanked by Lakshmi, Saraswati (~2.4m),
 *   and Ganesha, Kartikeya (~2.3m), with Lion and Mahishasura in dynamic combat at the feet.
 * 
 * @param {THREE.Scene} scene 
 * @returns {{ group: THREE.Group, dispose: () => void }}
 */
export function createDurgaTableau(scene) {
  const group = new THREE.Group();
  group.name = 'DurgaTableauMaster';

  // Base dais height in Phase 3 is floorY (0.65) + 0.8 = 1.45m
  const daisY = 1.45;
  const sanctumZ = -39.0;
  group.position.set(0, daisY, sanctumZ);

  const disposables = [];
  function registerGeom(geo) {
    disposables.push(geo);
    return geo;
  }

  // 1. Initialize custom PBR materials & procedural textures
  const { materials, dispose: disposeMaterials } = createIdolMaterials();
  disposables.push({ dispose: disposeMaterials });

  // ==========================================
  // 2. CEREMONIAL LOTUS THRONE (PADMA-PEETHA)
  // Stepped lotus base along the dais supporting all 5 divine figures
  // ==========================================
  const pedestalGroup = new THREE.Group();

  // Tier 1 Base Plinth (9.8m wide x 0.25m high x 3.4m deep)
  const pBaseGeo = registerGeom(new THREE.BoxGeometry(9.8, 0.25, 3.4));
  const pBase = new THREE.Mesh(pBaseGeo, materials.pedestalMat);
  pBase.position.set(0, 0.125, 0.4);
  pBase.receiveShadow = true;
  pedestalGroup.add(pBase);

  // Gold molding trim
  const pTrimGeo = registerGeom(new THREE.BoxGeometry(10.0, 0.08, 3.5));
  const pTrim = new THREE.Mesh(pTrimGeo, materials.goldOrnaments);
  pTrim.position.set(0, 0.28, 0.4);
  pedestalGroup.add(pTrim);

  // Radiating sculpted lotus petals along the plinth front top edge
  const petalCount = 28;
  const petalSpacing = 9.4 / (petalCount - 1);
  for (let i = 0; i < petalCount; i++) {
    const px = -4.7 + i * petalSpacing;
    const petGeo = registerGeom(new THREE.ConeGeometry(0.14, 0.28, 6));
    const petMesh = new THREE.Mesh(petGeo, materials.lotusPetalMat);
    petMesh.position.set(px, 0.38, 2.05);
    pedestalGroup.add(petMesh);
  }

  // Central elevated lotus dais for Maa Durga (3.2m wide, +0.2m higher)
  const cDaisGeo = registerGeom(new THREE.CylinderGeometry(1.6, 1.7, 0.2, 32));
  const cDais = new THREE.Mesh(cDaisGeo, materials.goldOrnaments);
  cDais.position.set(0, 0.42, 0.1);
  pedestalGroup.add(cDais);

  // Lotus petals encircling Durga's central dais
  for (let p = 0; p < 16; p++) {
    const angle = (p / 16) * Math.PI * 2;
    const petGeo = registerGeom(new THREE.ConeGeometry(0.14, 0.32, 6));
    const petMesh = new THREE.Mesh(petGeo, materials.lotusPetalMat);
    petMesh.position.set(Math.cos(angle) * 1.65, 0.48, 0.1 + Math.sin(angle) * 1.65);
    petMesh.rotation.x = Math.PI / 4;
    petMesh.rotation.y = angle;
    pedestalGroup.add(petMesh);
  }
  group.add(pedestalGroup);

  // ==========================================
  // 3. COMBAT SCULPTURE: LION & MAHISHASURA
  // ==========================================
  const lionAndAsura = createLionAndAsura(materials, registerGeom);
  lionAndAsura.position.set(0, 0.35, 0.1);
  group.add(lionAndAsura);

  // ==========================================
  // 4. CENTRAL FIGURE: MAA DURGA (DASHABHUJA)
  // ==========================================
  const durga = createDurgaFigure(materials, registerGeom);
  durga.position.set(0, 0.35, 0);
  group.add(durga);

  // ==========================================
  // 5. SUPPORTING DEITIES: GANESHA, LAKSHMI, SARASWATI, KARTIKEYA
  // ==========================================
  const supporting = createSupportingDeities(materials, registerGeom);
  supporting.position.set(0, 0.32, -0.05);
  group.add(supporting);

  // ==========================================
  // 6. CHALCHITRA ARCH MEDALLIONS (Miniature painted panel inserts)
  // Semi-circular arch band featuring Shiva & celestial vignettes
  // ==========================================
  const chalchitraGroup = new THREE.Group();
  chalchitraGroup.position.set(0, 3.8, -0.85);

  // Lord Shiva in meditation at the apex of the Chalchitra
  const shivaApex = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.35, 16, 16)), materials.whiteSwan);
  shivaApex.position.set(0, 3.1, 0);
  chalchitraGroup.add(shivaApex);

  const shivaTrishul = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8)), materials.goldOrnaments);
  shivaTrishul.position.set(0.28, 3.2, 0.05);
  chalchitraGroup.add(shivaTrishul);

  // Radiating painted decorative medallions along the Chalchitra rim
  const medallionCount = 13;
  for (let m = 0; m < medallionCount; m++) {
    const angle = (m / (medallionCount - 1)) * Math.PI;
    const mx = Math.cos(angle) * 4.4;
    const my = Math.sin(angle) * 3.2;

    const medRim = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 16)), materials.goldOrnaments);
    medRim.rotation.x = Math.PI / 2;
    medRim.position.set(mx, my, 0);
    chalchitraGroup.add(medRim);

    const medInner = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 16)), (m % 2 === 0) ? materials.durgaSaree : materials.lakshmiSaree);
    medInner.rotation.x = Math.PI / 2;
    medInner.position.set(mx, my, 0.01);
    chalchitraGroup.add(medInner);
  }
  group.add(chalchitraGroup);

  // ==========================================
  // 7. DEVOTIONAL DARSHAN LIGHTING
  // Focused, warm, respectful lighting illuminating the divine tableau
  // ==========================================
  // A. Key devotional spotlight focused on Maa Durga's face and crown
  const faceSpotlight = new THREE.SpotLight(0xfffaee, 2.5, 18, Math.PI / 4.6, 0.45, 1.2);
  faceSpotlight.position.set(0, 4.8, 5.5);
  faceSpotlight.target.position.set(0, 3.2, 0);
  faceSpotlight.castShadow = true;
  group.add(faceSpotlight);
  group.add(faceSpotlight.target);

  // B. Warm lateral fill lights highlighting the ten arms & weapons
  const fillLeft = new THREE.PointLight(0xffba55, 1.7, 12, 1.5);
  fillLeft.position.set(-3.5, 2.8, 2.8);
  group.add(fillLeft);

  const fillRight = new THREE.PointLight(0xffba55, 1.7, 12, 1.5);
  fillRight.position.set(3.5, 2.8, 2.8);
  group.add(fillRight);

  // C. Ceremonial Brass Lamps (Pradeep / Panchapradip) at the foot of the dais
  function createCeremonialLamp(xPos, zPos) {
    const lamp = new THREE.Group();
    lamp.position.set(xPos, 0.3, zPos);

    const lStand = new THREE.Mesh(registerGeom(new THREE.CylinderGeometry(0.08, 0.16, 0.45, 12)), materials.goldOrnaments);
    lStand.position.y = 0.22;
    lamp.add(lStand);

    const lBowl = new THREE.Mesh(registerGeom(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)), materials.goldOrnaments);
    lBowl.rotation.x = Math.PI;
    lBowl.position.y = 0.46;
    lamp.add(lBowl);

    // Glowing flame (Diya)
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });
    disposables.push(flameMat);
    const flame = new THREE.Mesh(registerGeom(new THREE.ConeGeometry(0.04, 0.14, 8)), flameMat);
    flame.position.y = 0.52;
    lamp.add(flame);

    const flameLight = new THREE.PointLight(0xff9933, 1.1, 4.5, 2);
    flameLight.position.y = 0.55;
    lamp.add(flameLight);

    return lamp;
  }

  group.add(createCeremonialLamp(-4.2, 1.4));
  group.add(createCeremonialLamp(-1.8, 1.4));
  group.add(createCeremonialLamp(1.8, 1.4));
  group.add(createCeremonialLamp(4.2, 1.4));

  scene.add(group);

  function dispose() {
    scene.remove(group);
    disposables.forEach((item) => {
      if (item && item.dispose) item.dispose();
    });
  }

  return {
    group,
    daisY,
    sanctumZ,
    dispose,
  };
}
