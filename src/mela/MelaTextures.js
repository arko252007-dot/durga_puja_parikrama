import * as THREE from 'three';

/**
 * Creates canvas textures for festival mela signage, banners, stall awnings, and festoons.
 */

export function createStallSignTexture(text, bgColor = '#8b1e22', textColor = '#ffffff', borderColor = '#e6c65b') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  // Ornamental border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 112);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 484, 100);

  // Corner decorative dots
  ctx.fillStyle = borderColor;
  const dots = [
    [20, 20], [492, 20], [20, 108], [492, 108],
    [256, 20], [256, 108]
  ];
  dots.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createAwningStripesTexture(color1 = '#b32230', color2 = '#f5efe0') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = color2;
  const stripeWidth = 16;
  for (let x = 0; x < 128; x += stripeWidth * 2) {
    ctx.fillRect(x, 0, stripeWidth, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createMelaPathwayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Weathered earth / compacted festival gravel & brick dust
  ctx.fillStyle = '#221915';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle paving variation
  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 32) {
      const shade = Math.floor(25 + Math.random() * 15);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade + 2}, ${shade})`;
      ctx.fillRect(x + 2, y + 2, 28, 28);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
