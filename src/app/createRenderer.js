import * as THREE from 'three';

/**
 * Creates and configures the WebGLRenderer with standard color space,
 * ACES tone mapping, soft shadows, and responsive sizing.
 * 
 * @param {HTMLElement} container 
 * @returns {{ renderer: THREE.WebGLRenderer, handleResize: (width: number, height: number) => void, dispose: () => void }}
 */
export function createRenderer(container) {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });

  const getAppropriateDPR = () => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches || (window.innerWidth <= 1024 && ('ontouchstart' in window));
    const maxDPR = isMobile ? 1.5 : 2.0;
    return Math.min(window.devicePixelRatio || 1, maxDPR);
  };

  renderer.setSize(width, height);
  renderer.setPixelRatio(getAppropriateDPR());

  // Modern Three.js color management & tone mapping
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Shadow mapping setup with soft penumbras
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild(renderer.domElement);

  function handleResize(newWidth, newHeight) {
    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(getAppropriateDPR());
  }

  function dispose() {
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer.dispose();
  }

  return {
    renderer,
    handleResize,
    dispose,
  };
}
