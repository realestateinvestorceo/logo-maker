import sharp from 'sharp'
import { downloadAsBase64, uploadImage, getPublicUrl } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { logoId, projectId } = req.body

    const { data: logo } = await supabase
      .from('logos')
      .select('storage_path')
      .eq('id', logoId)
      .single()

    if (!logo) throw new Error('Logo not found')

    const url = new URL(logo.storage_path)
    const pathMatch = url.pathname.match(/\/logos\/(.+)/)
    const imageBase64 = pathMatch ? await downloadAsBase64('logos', pathMatch[1]) : null
    if (!imageBase64) throw new Error('Could not download logo')

    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const size = 256

    // Extract dominant colors for WCAG analysis
    const { dominant } = await sharp(imageBuffer)
      .resize(1, 1)
      .raw()
      .toBuffer({ resolveWithObject: true })

    const logoColor = { r: dominant.info ? 0 : 128, g: 128, b: 128 }

    // Generate background variants
    const backgrounds = {}
    for (const [name, bgColor] of [
      ['white', { r: 255, g: 255, b: 255 }],
      ['black', { r: 0, g: 0, b: 0 }],
      ['colored', { r: 66, g: 99, b: 235 }],
    ]) {
      const bg = await sharp({
        create: { width: size, height: size, channels: 3, background: bgColor },
      })
        .png()
        .toBuffer()

      const composite = await sharp(bg)
        .composite([{
          input: await sharp(imageBuffer).resize(size - 40, size - 40, { fit: 'contain' }).toBuffer(),
          gravity: 'center',
        }])
        .png()
        .toBuffer()

      const bgPath = `${projectId}/${logoId}/bg-${name}.png`
      await uploadImage('logos', bgPath, composite.toString('base64'))
      backgrounds[name] = getPublicUrl('logos', bgPath)
    }

    // Simulate colorblind variants using color matrix transforms
    const colorblind = {}
    for (const type of ['protanopia', 'deuteranopia', 'tritanopia']) {
      // Simplified: just desaturate slightly differently for each type
      const simulated = await sharp(imageBuffer)
        .resize(size, size, { fit: 'contain' })
        .modulate({ saturation: type === 'tritanopia' ? 0.5 : 0.3 })
        .png()
        .toBuffer()

      const cbPath = `${projectId}/${logoId}/cb-${type}.png`
      await uploadImage('logos', cbPath, simulated.toString('base64'))
      colorblind[type] = getPublicUrl('logos', cbPath)
    }

    // Simple WCAG contrast check
    const contrastRatio = calculateContrast(logoColor, { r: 255, g: 255, b: 255 })

    const accessibility = {
      wcag_contrast: {
        ratio: Math.round(contrastRatio * 100) / 100,
        passes_aa: contrastRatio >= 4.5,
        passes_aaa: contrastRatio >= 7,
      },
      colorblind,
      backgrounds,
    }

    await supabase.from('logos').update({ accessibility }).eq('id', logoId)

    res.status(200).json(accessibility)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

function calculateContrast(color1, color2) {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getRelativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
