// src/lib/color-utils.ts
// Utilities for color conversion and manipulation

/** Degrees in a circle for hue calculation */
const DEGREES_IN_CIRCLE = 360;

/** Multiplier for hue calculation (60 degrees per RGB segment) */
const HUE_SEGMENT = 60;

/** Multiplier for converting ratio to percentage */
const PERCENT_MULTIPLIER = 100;

/** RGB max value for normalization */
const RGB_MAX = 255;

/**
 * Convert a hex color to HSL format.
 *
 * @param hex - Hex color string (e.g., "#ff0000" or "#f00")
 * @returns HSL string in format "h s% l%" for CSS variables
 */
export function hexToHsl(hex: string): string {
  let r = 0,
    g = 0,
    b = 0;

  // Handle short hex (#RGB)
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  }
  // Handle full hex (#RRGGBB)
  else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }

  // Normalize to 0-1 range
  r /= RGB_MAX;
  g /= RGB_MAX;
  b /= RGB_MAX;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = 0;

  // Calculate hue
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * HUE_SEGMENT);
  if (h < 0) h += DEGREES_IN_CIRCLE;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Convert to percentages with one decimal place
  s = +(s * PERCENT_MULTIPLIER).toFixed(1);
  l = +(l * PERCENT_MULTIPLIER).toFixed(1);

  return `${h} ${s}% ${l}%`;
}
