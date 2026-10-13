import * as THREE from 'three';

/**
 * Creates an authentic Sharadotsav (Kolkata Durga Puja autumn night) sky dome texture.
 * Features:
 * - Smooth vertical gradient from deep zenith midnight navy to royal evening indigo,
 *   fading into a warm dusk twilight horizon reflecting distant festival city illuminations.
 * - Gentle twinkling starry field in the upper celestial dome.
 * - Horizon dusk tone that seamlessly harmonizes with the ground plane and atmospheric depth fog.
 * 
 * @returns {THREE.CanvasTexture}
 */
export function createFestivalSkyTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Upper Celestial Hemisphere (Zenith to Horizon: y = 0 to 512)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0.0, '#060914'); // Deep zenith midnight navy
  skyGrad.addColorStop(0.35, '#0c1326'); // Royal evening indigo
  skyGrad.addColorStop(0.70, '#151c33'); // Dusky twilight atmospheric blue
  skyGrad.addColorStop(0.92, '#221c2c'); // Twilight purple
  skyGrad.addColorStop(1.0, '#2a1e26');  // Warm horizon festival glow reflecting city illuminations
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, 512);

  // 2. Lower Ground Occlusion Hemisphere (Horizon to Nadir: y = 512 to 1024)
  const groundGrad = ctx.createLinearGradient(0, 512, 0, 1024);
  groundGrad.addColorStop(0.0, '#2a1e26');
  groundGrad.addColorStop(0.15, '#181822');
  groundGrad.addColorStop(1.0, '#10121a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 512, width, 512);

  // 3. Subtle Sharadotsav Starry Celestial Field
  // Deterministic PRNG to ensure zero frame-to-frame jitter
  let seed = 1947;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const starCount = 450;
  for (let i = 0; i < starCount; i++) {
    const sx = pseudoRandom() * width;
    // Stars placed mostly in upper celestial dome (y: 30 to 450)
    const sy = 30 + pseudoRandom() * 420;
    const r = 0.5 + pseudoRandom() * 1.1;
    const alpha = 0.25 + pseudoRandom() * 0.65;

    ctx.fillStyle = `rgba(235, 242, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Subtle Warm City Illuminations Glow on the Horizon Line
  const horizonGlow = ctx.createLinearGradient(0, 420, 0, 512);
  horizonGlow.addColorStop(0.0, 'rgba(230, 140, 60, 0)');
  horizonGlow.addColorStop(0.6, 'rgba(210, 120, 55, 0.08)');
  horizonGlow.addColorStop(1.0, 'rgba(180, 90, 45, 0.18)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, 420, width, 92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}
