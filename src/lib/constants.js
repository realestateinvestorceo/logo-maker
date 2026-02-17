export const PHASES = [
  { id: 1, name: 'Onboarding', path: '/onboard', description: 'Company intelligence gathering' },
  { id: 2, name: 'Strategy', path: '/strategy', description: 'Creative direction proposals' },
  { id: 3, name: 'Generate', path: '/generate', description: 'Batch logo generation' },
  { id: 4, name: 'Review', path: '/review-logos', description: 'Browse, branch & refine' },
  { id: 5, name: 'Grade', path: '/grading', description: 'Scoring & stress testing' },
  { id: 6, name: 'Compare', path: '/compare', description: 'Version history & comparison' },
  { id: 7, name: 'Share', path: '/share', description: 'Boss review page' },
  { id: 8, name: 'Export', path: '/export', description: 'Brand kit download' },
]

export const DIRECTION_TYPES = [
  { id: 'wordmark', label: 'Wordmark / Typographic' },
  { id: 'abstract_symbol', label: 'Abstract Symbol' },
  { id: 'lettermark', label: 'Lettermark / Monogram' },
  { id: 'mascot', label: 'Mascot / Character' },
  { id: 'negative_space', label: 'Negative Space / Clever Concept' },
  { id: 'emblem', label: 'Industry Emblem / Badge' },
]

export const SCORE_DIMENSIONS = [
  { key: 'memorability', label: 'Memorability', description: 'Would you recognize it after one glance?' },
  { key: 'scalability', label: 'Scalability', description: 'Does it work at 16px and on a billboard?' },
  { key: 'relevance', label: 'Relevance', description: 'Does it communicate the right industry/feeling?' },
  { key: 'uniqueness', label: 'Uniqueness', description: 'Does it avoid cliche and differentiate?' },
  { key: 'simplicity', label: 'Simplicity', description: 'Could you sketch it from memory?' },
]

export const STYLE_OPTIONS = [
  'flat', 'minimal', 'hand-drawn', '3D', 'vintage', 'geometric', 'gradient', 'line-art',
]

export const PALETTE_OPTIONS = [
  'monochrome', 'vibrant', 'earth-tones', 'pastel', 'dark', 'brand-colors',
]

export const COMPOSITION_OPTIONS = [
  'icon-only', 'icon-text', 'text-only', 'stacked', 'horizontal', 'contained',
]

export const EXPORT_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024]

export const MOCKUP_TYPES = [
  { key: 'business_card', label: 'Business Card' },
  { key: 'website_header', label: 'Website Header' },
  { key: 'app_icon', label: 'App Icon' },
  { key: 'social_avatar', label: 'Social Media Avatar' },
  { key: 'dark_bg', label: 'Dark Background' },
  { key: 'product', label: 'Product / Merch' },
]
