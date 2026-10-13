import * as THREE from 'three';

/**
 * Procedural texture and material generators for festival visitors in Phase 5.
 * Variety of authentic Kolkata festive attire:
 * - Traditional Lal-Paad Saree (white with red border)
 * - Silk Sarees (Mustard Gold, Teal Peacock, Crimson Maroon, Royal Indigo)
 * - Kurtas / Panjabis (Tussar silk, Royal blue, Maroon, Cream, Olive)
 * - Modern festive casuals (polo shirts, denims, chinos, tunics)
 * - Varied natural Indian skin tones (warm golden, deep bronze, wheatish, rich copper)
 */

export function createCrowdMaterials() {
  const disposables = [];

  function register(res) {
    disposables.push(res);
    return res;
  }

  // Helper for generating patterned fabric canvas texture
  function createFabricTexture(baseColor, patternColor, type = 'dots') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = patternColor;
    if (type === 'dots') {
      for (let y = 16; y < 128; y += 32) {
        for (let x = 16; x < 128; x += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'stripes') {
      for (let y = 0; y < 128; y += 16) {
        ctx.fillRect(0, y, 128, 4);
      }
    } else if (type === 'border') {
      ctx.fillRect(0, 0, 128, 20);
      ctx.fillRect(0, 108, 128, 20);
      ctx.fillStyle = '#ffffff';
      for (let x = 8; x < 128; x += 16) {
        ctx.fillRect(x, 6, 8, 8);
        ctx.fillRect(x, 114, 8, 8);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return register(tex);
  }

  // 1. Natural Skin Tones (Indian Subcontinent Palette - soft natural skin)
  const skinColors = [
    0xbc8255, // Wheatish warm
    0x965d37, // Rich copper / bronze
    0xd29d71, // Fair golden
    0x7b4825, // Deep dusk
    0xa66c42, // Medium warm tan
  ];
  const skinMaterials = skinColors.map((col) =>
    register(
      new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.74,
        metalness: 0.01,
      })
    )
  );

  // 2. Hair Materials (Black, dark charcoal, subtle henna tint - natural matte hair)
  const hairColors = [0x110d0a, 0x1c1714, 0x241812, 0x0a0908];
  const hairMaterials = hairColors.map((col) =>
    register(
      new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.82,
        metalness: 0.02,
      })
    )
  );

  // 3. Traditional Bengali & Festive Outfits
  // A. Classic Lal-Paad Saree (White/Cream with bold Red border)
  const lalPaadTex = createFabricTexture('#f7f3e8', '#aa1d2b', 'border');
  lalPaadTex.repeat.set(1, 2);
  const lalPaadMat = register(
    new THREE.MeshStandardMaterial({
      map: lalPaadTex,
      roughness: 0.65,
      metalness: 0.05,
    })
  );

  // B. Silk / Brocade Sarees & Kurtas
  const festiveColorPairs = [
    { base: '#b32230', accent: '#d4af37', type: 'dots' },    // Crimson Red & Gold Zari
    { base: '#1b4d3e', accent: '#e6c65b', type: 'dots' },    // Peacock Forest Green & Gold
    { base: '#d48817', accent: '#7b1113', type: 'dots' },    // Mustard Marigold & Maroon
    { base: '#1f3864', accent: '#c9a03b', type: 'stripes' }, // Royal Blue Panjabi with Gold
    { base: '#6a203a', accent: '#e8b86d', type: 'stripes' }, // Magenta / Jamdani
    { base: '#4a6b82', accent: '#ffffff', type: 'dots' },    // Slate Blue Modern
    { base: '#dcd1b8', accent: '#8c2d19', type: 'border' },   // Tussar Silk with Terracotta Border
    { base: '#2b2b2b', accent: '#4a4a4a', type: 'stripes' }, // Charcoal Formal Trousers / Kurta
  ];

  const outfitMaterials = festiveColorPairs.map((p) => {
    const tex = createFabricTexture(p.base, p.accent, p.type);
    tex.repeat.set(1, 2);
    return register(
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.68,
        metalness: 0.06,
      })
    );
  });
  outfitMaterials.unshift(lalPaadMat);

  // 4. Footwear Materials (Traditional Kolhapuri/Jutti Tan, Dark Brown Leather, Black Sandals)
  const shoeMaterials = [
    register(new THREE.MeshStandardMaterial({ color: 0x5a331c, roughness: 0.8 })),
    register(new THREE.MeshStandardMaterial({ color: 0x221a15, roughness: 0.7 })),
    register(new THREE.MeshStandardMaterial({ color: 0x8a542b, roughness: 0.85 })),
  ];

  // 5. Traditional Accessories (Dupatta / Uttariyo / Shawl, Golden Bangles)
  const goldJewelryMat = register(
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8,
    })
  );

  return {
    skinMaterials,
    hairMaterials,
    outfitMaterials,
    shoeMaterials,
    goldJewelryMat,
    dispose: () => {
      disposables.forEach((d) => d.dispose && d.dispose());
    },
  };
}
