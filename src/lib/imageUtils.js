/**
 * Resize an image using canvas
 */
export function resizeImage(imageSrc, targetSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetSize
      canvas.height = targetSize
      const ctx = canvas.getContext('2d')

      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw centered and scaled to fit
      const scale = Math.min(targetSize / img.width, targetSize / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (targetSize - w) / 2
      const y = (targetSize - h) / 2

      ctx.drawImage(img, x, y, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

/**
 * Render a logo onto a colored background
 */
export function renderOnBackground(imageSrc, bgColor, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      // Draw background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)

      // Draw logo centered with padding
      const padding = size * 0.1
      const available = size - padding * 2
      const scale = Math.min(available / img.width, available / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (size - w) / 2
      const y = (size - h) / 2

      ctx.drawImage(img, x, y, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

/**
 * Extract dominant colors from an image using canvas sampling
 */
export function extractDominantColors(imageSrc, numColors = 5) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 100
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size).data
      const colorCounts = {}

      for (let i = 0; i < imageData.length; i += 4) {
        const r = Math.round(imageData[i] / 16) * 16
        const g = Math.round(imageData[i + 1] / 16) * 16
        const b = Math.round(imageData[i + 2] / 16) * 16
        const a = imageData[i + 3]

        if (a < 128) continue // Skip transparent pixels

        const key = `${r},${g},${b}`
        colorCounts[key] = (colorCounts[key] || 0) + 1
      }

      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, numColors)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number)
          const hex = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
          return { hex, rgb: { r, g, b } }
        })

      resolve(sorted)
    }
    img.onerror = reject
    img.src = imageSrc
  })
}
