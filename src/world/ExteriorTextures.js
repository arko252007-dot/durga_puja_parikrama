import * as THREE from 'three';

/**
 * Procedural texture generator for Kolkata Durga Puja Pandal Exterior.
 * Generates crisp, authentic materials with zero external network dependencies.
 */

export function createTerracottaPanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base terracotta clay color
  ctx.fillStyle = '#9c4126';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle clay stippling / texture
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? '#b85435' : '#7d3019';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer relief border frame
  ctx.strokeStyle = '#c86845';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 480);

  ctx.strokeStyle = '#6e2714';
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, 456, 456);

  // Traditional Bishnupur style floral medallion / lotus motif in center
  ctx.save();
  ctx.translate(256, 256);

  // Outer petal ring
  ctx.fillStyle = '#b85435';
  ctx.strokeStyle = '#6e2714';
  ctx.lineWidth = 4;
  const petals = 12;
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((i * 2 * Math.PI) / petals);
    ctx.beginPath();
    ctx.ellipse(0, -110, 28, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Inner petal ring
  ctx.fillStyle = '#d67450';
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((i * 2 * Math.PI) / petals + Math.PI / petals);
    ctx.beginPath();
    ctx.ellipse(0, -65, 18, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Central rosette
  ctx.fillStyle = '#e88b64';
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#5c1f0e';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Corner decorative floral stamps
  const corners = [[64, 64], [448, 64], [64, 448], [448, 448]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#c86845';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6e2714';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createOrnamentalBorderTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Deep ivory / pale ochre sandstone base
  ctx.fillStyle = '#e2d5bd';
  ctx.fillRect(0, 0, 512, 128);

  // Gold accent bands top and bottom
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 0, 512, 12);
  ctx.fillRect(0, 116, 512, 12);

  // Repeating carved dentils / lotus frieze
  const units = 8;
  const unitWidth = 512 / units;
  for (let i = 0; i < units; i++) {
    const x = i * unitWidth;

    // Diamond / relief cartouche
    ctx.fillStyle = '#c99632';
    ctx.beginPath();
    ctx.moveTo(x + unitWidth / 2, 22);
    ctx.lineTo(x + unitWidth - 6, 64);
    ctx.lineTo(x + unitWidth / 2, 106);
    ctx.lineTo(x + 6, 64);
    ctx.closePath();
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = '#f3e5b8';
    ctx.beginPath();
    ctx.arc(x + unitWidth / 2, 64, 14, 0, Math.PI * 2);
    ctx.fill();

    // Terracotta dot in center
    ctx.fillStyle = '#9c4126';
    ctx.beginPath();
    ctx.arc(x + unitWidth / 2, 64, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createAlponaRunnerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Traditional ceremonial red carpet runner
  ctx.fillStyle = '#7a141d';
  ctx.fillRect(0, 0, 512, 1024);

  // White Bengali alpona border along both sides
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 0, 472, 1024);
  ctx.strokeRect(36, 0, 440, 1024);

  // Center repeating traditional floral alpona motifs
  for (let y = 128; y < 1024; y += 256) {
    ctx.save();
    ctx.translate(256, y);

    // Outer mandala circle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Petals
    const petals = 8;
    for (let p = 0; p < petals; p++) {
      ctx.save();
      ctx.rotate((p * 2 * Math.PI) / petals);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -50, 12, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Central concentric circles
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7a141d';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPavingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Sandstone paving tiles
  ctx.fillStyle = '#222733';
  ctx.fillRect(0, 0, 512, 512);

  // Tile grid
  const tilesX = 4;
  const tilesY = 4;
  const w = 512 / tilesX;
  const h = 512 / tilesY;

  for (let x = 0; x < tilesX; x++) {
    for (let y = 0; y < tilesY; y++) {
      ctx.fillStyle = ((x + y) % 2 === 0) ? '#282e3c' : '#212632';
      ctx.fillRect(x * w + 3, y * h + 3, w - 6, h - 6);

      // Subtle noise on stone tiles
      for (let n = 0; n < 80; n++) {
        const nx = x * w + Math.random() * w;
        const ny = y * h + Math.random() * h;
        ctx.fillStyle = Math.random() > 0.5 ? '#353c4d' : '#181c25';
        ctx.fillRect(nx, ny, 2, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
