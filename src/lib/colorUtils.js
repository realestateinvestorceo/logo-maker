/**
 * Calculate relative luminance of a hex color (WCAG formula)
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex)
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate WCAG contrast ratio between two hex colors
 */
export function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check WCAG compliance levels
 */
export function checkWcagCompliance(foreground, background) {
  const ratio = getContrastRatio(foreground, background)
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  }
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex) {
  hex = hex.replace('#', '')
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  }
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

/**
 * Simulate color blindness on a hex color
 */
export function simulateColorBlindness(hex, type) {
  const { r, g, b } = hexToRgb(hex)

  const matrices = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  }

  const m = matrices[type]
  if (!m) return hex

  const nr = m[0][0] * r + m[0][1] * g + m[0][2] * b
  const ng = m[1][0] * r + m[1][1] * g + m[1][2] * b
  const nb = m[2][0] * r + m[2][1] * g + m[2][2] * b

  return rgbToHex(
    Math.min(255, Math.max(0, nr)),
    Math.min(255, Math.max(0, ng)),
    Math.min(255, Math.max(0, nb))
  )
}
