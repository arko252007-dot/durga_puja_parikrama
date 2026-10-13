/**
 * Detection helper for touch-capable devices (smartphones, tablets).
 * Differentiates touch/mobile devices from standard desktop mouse/keyboard setups.
 */
export function isMobileDevice() {
  const hasTouch = (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)
  );

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.innerWidth <= 1024 || window.innerHeight <= 1024;

  return hasTouch && (isCoarsePointer || isSmallScreen);
}
