import * as THREE from 'three';

/**
 * Procedural texture and material definitions for the Durga Puja Pratima Tableau.
 * Captures authentic Kumartuli clay painting and Daker Saaj gold filigree artistry.
 */

export function createDurgaFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base warm golden-ochre idol clay skin
  ctx.fillStyle = '#e8a85c';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle skin gradient / blush
  const blushGrad = ctx.createRadialGradient(256, 300, 30, 256, 300, 200);
  blushGrad.addColorStop(0, 'rgba(215, 120, 85, 0.35)');
  blushGrad.addColorStop(1, 'rgba(232, 168, 92, 0)');
  ctx.fillStyle = blushGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Traditional Bengali Almond / Lotus Eyes (Kori Chokh)
  function drawEye(cx, cy, isLeft) {
    ctx.save();
    ctx.translate(cx, cy);
    if (isLeft) ctx.scale(-1, 1);

    // Eye whites with curved almond silhouette
    ctx.fillStyle = '#fbfbfc';
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.bezierCurveTo(-30, -32, 30, -32, 60, 0);
    ctx.bezierCurveTo(30, 26, -30, 26, -60, 0);
    ctx.fill();

    // Iris (Large expressive deep black with warm amber ring)
    ctx.fillStyle = '#1a0e05';
    ctx.beginPath();
    ctx.arc(0, -2, 22, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, -2, 14, 0, Math.PI * 2);
    ctx.fill();

    // Specular catchlight reflection
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Heavy traditional Kohl / Kajal eyeliner extending into elegant wing
    ctx.strokeStyle = '#050302';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-68, -4);
    ctx.bezierCurveTo(-30, -38, 30, -38, 72, -8);
    ctx.stroke();

    // Lower eyeliner
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-64, 0);
    ctx.bezierCurveTo(-20, 30, 20, 30, 68, -4);
    ctx.stroke();

    // Arched Eyebrow
    ctx.strokeStyle = '#120803';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-65, -45);
    ctx.bezierCurveTo(-20, -75, 30, -75, 75, -48);
    ctx.stroke();

    ctx.restore();
  }

  // Draw left and right eyes
  drawEye(175, 230, true);
  drawEye(337, 230, false);

  // Third Eye (Trinayana) on the Forehead
  ctx.save();
  ctx.translate(256, 145);
  // Vertical eye shape
  ctx.fillStyle = '#f8f8fa';
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.bezierCurveTo(16, -15, 16, 15, 0, 32);
  ctx.bezierCurveTo(-16, 15, -16, -15, 0, -32);
  ctx.fill();

  ctx.fillStyle = '#8f121d'; // Crimson inner flame / iris
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#b81424'; // Red vermillion border
  ctx.lineWidth = 4;
  ctx.stroke();

  // White sacred Chandan dots around the third eye
  ctx.fillStyle = '#ffffff';
  for (let d = -22; d <= 22; d += 11) {
    if (d !== 0) {
      ctx.beginPath();
      ctx.arc(d * 1.2, -40, 3, 0, Math.PI * 2);
      ctx.arc(d * 1.2, 40, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Sculpted Red Lips (Delicate traditional smile)
  ctx.save();
  ctx.translate(256, 365);
  ctx.fillStyle = '#b32230';
  ctx.beginPath();
  ctx.moveTo(-45, 0);
  ctx.bezierCurveTo(-20, -18, 0, -8, 0, -8);
  ctx.bezierCurveTo(0, -8, 20, -18, 45, 0);
  ctx.bezierCurveTo(20, 24, -20, 24, -45, 0);
  ctx.fill();

  ctx.strokeStyle = '#6e0f18';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-44, 0);
  ctx.lineTo(44, 0);
  ctx.stroke();
  ctx.restore();

  // Golden nose ring (Nath) on left nostril
  ctx.save();
  ctx.translate(230, 310);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#c92a38';
  ctx.beginPath();
  ctx.arc(-14, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBrocadeTexture(baseColorHex, zariColorHex = '#d4af37') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Gold zari border along top and bottom
  ctx.fillStyle = zariColorHex;
  ctx.fillRect(0, 0, 512, 36);
  ctx.fillRect(0, 476, 512, 36);

  // Repeating paisley / buti motifs across fabric
  const stepX = 64;
  const stepY = 64;
  for (let x = 32; x < 512; x += stepX) {
    for (let y = 64; y < 460; y += stepY) {
      ctx.fillStyle = zariColorHex;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#851b22';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createIdolMaterials() {
  const durgaFaceTex = createDurgaFaceTexture();
  const redBrocadeTex = createBrocadeTexture('#9c1824', '#e6bf47');
  const yellowBrocadeTex = createBrocadeTexture('#c98918', '#f3d368');
  const whiteBrocadeTex = createBrocadeTexture('#f2eee6', '#d4af37');
  const blueBrocadeTex = createBrocadeTexture('#1d4b8a', '#e6bf47');

  const materials = {
    // Skin materials (Authentic soft unglazed Kumartuli clay)
    divineSkin: new THREE.MeshStandardMaterial({
      color: 0xe8a85c,
      roughness: 0.65,
      metalness: 0.01,
    }),
    durgaFace: new THREE.MeshStandardMaterial({
      map: durgaFaceTex,
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.01,
    }),
    ganeshaSkin: new THREE.MeshStandardMaterial({
      color: 0xf09f6b,
      roughness: 0.68,
      metalness: 0.01,
    }),
    asuraSkin: new THREE.MeshStandardMaterial({
      color: 0x3d7052, // Fierce green-toned demon complexion
      roughness: 0.65,
      metalness: 0.02,
    }),
    buffaloSkin: new THREE.MeshStandardMaterial({
      color: 0x222428, // Dark buffalo hide
      roughness: 0.78,
      metalness: 0.05,
    }),
    lionFur: new THREE.MeshStandardMaterial({
      color: 0xd4a044, // Golden royal festival lion
      roughness: 0.75,
      metalness: 0.02,
    }),
    lionMane: new THREE.MeshStandardMaterial({
      color: 0xb57829, // Darker golden-brown mane
      roughness: 0.80,
      metalness: 0.01,
    }),

    // Daker Saaj / Golden & Silver Filigree Ornaments
    goldOrnaments: new THREE.MeshStandardMaterial({
      color: 0xf5ca44,
      roughness: 0.22,
      metalness: 0.88,
    }),
    silverOrnaments: new THREE.MeshStandardMaterial({
      color: 0xe8edf2,
      roughness: 0.24,
      metalness: 0.84,
    }),

    // Clothing / Drapery (Authentic Zari-bordered festive brocade silk)
    durgaSaree: new THREE.MeshStandardMaterial({
      map: redBrocadeTex,
      color: 0x9c1824,
      roughness: 0.54,
      metalness: 0.12,
    }),
    lakshmiSaree: new THREE.MeshStandardMaterial({
      map: yellowBrocadeTex,
      color: 0xc98918,
      roughness: 0.54,
      metalness: 0.12,
    }),
    saraswatiSaree: new THREE.MeshStandardMaterial({
      map: whiteBrocadeTex,
      color: 0xf5f3ee,
      roughness: 0.54,
      metalness: 0.12,
    }),
    kartikeyaDhoti: new THREE.MeshStandardMaterial({
      map: blueBrocadeTex,
      color: 0x1d4b8a,
      roughness: 0.54,
      metalness: 0.12,
    }),
    ganeshaDhoti: new THREE.MeshStandardMaterial({
      color: 0xd9731e, // Bright festive saffron
      roughness: 0.65,
      metalness: 0.04,
    }),
    asuraDhoti: new THREE.MeshStandardMaterial({
      color: 0x5a1820, // Dark maroon
      roughness: 0.8,
      metalness: 0.05,
    }),

    // Weapons & Attributes
    weaponSteel: new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      roughness: 0.2,
      metalness: 0.9,
    }),
    weaponGold: new THREE.MeshStandardMaterial({
      color: 0xf0c43f,
      roughness: 0.25,
      metalness: 0.85,
    }),
    sacredLotus: new THREE.MeshStandardMaterial({
      color: 0xe85d75, // Pink lotus
      roughness: 0.6,
      metalness: 0.02,
    }),
    sacredVeena: new THREE.MeshStandardMaterial({
      color: 0x6e381b, // Polished dark mahogany wood
      roughness: 0.35,
      metalness: 0.15,
    }),

    // Vahanas
    whiteSwan: new THREE.MeshStandardMaterial({
      color: 0xf8f9fa,
      roughness: 0.5,
      metalness: 0.02,
    }),
    royalPeacock: new THREE.MeshStandardMaterial({
      color: 0x0f5a7a, // Deep peacock teal/blue
      roughness: 0.35,
      metalness: 0.4,
    }),
    peacockFeather: new THREE.MeshStandardMaterial({
      color: 0x1b7d52, // Emerald green
      roughness: 0.4,
      metalness: 0.3,
    }),
    owlBrown: new THREE.MeshStandardMaterial({
      color: 0x634226,
      roughness: 0.7,
      metalness: 0.02,
    }),
    mouseGrey: new THREE.MeshStandardMaterial({
      color: 0x6e6e73,
      roughness: 0.65,
      metalness: 0.02,
    }),

    // Pedestal & Backdrop
    pedestalMat: new THREE.MeshStandardMaterial({
      color: 0xd6cbb4,
      roughness: 0.6,
      metalness: 0.05,
    }),
    lotusPetalMat: new THREE.MeshStandardMaterial({
      color: 0xe06078,
      roughness: 0.55,
      metalness: 0.05,
    }),
  };

  const textures = [
    durgaFaceTex,
    redBrocadeTex,
    yellowBrocadeTex,
    whiteBrocadeTex,
    blueBrocadeTex,
  ];

  function dispose() {
    textures.forEach((t) => t.dispose());
    Object.values(materials).forEach((m) => m.dispose());
  }

  return { materials, dispose };
}
