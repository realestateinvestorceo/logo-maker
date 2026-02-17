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

    // Download original image
    const url = new URL(logo.storage_path)
    const pathMatch = url.pathname.match(/\/logos\/(.+)/)
    const imageBase64 = pathMatch ? await downloadAsBase64('logos', pathMatch[1]) : null
    if (!imageBase64) throw new Error('Could not download logo')

    const imageBuffer = Buffer.from(imageBase64, 'base64')

    const sizes = [16, 32, 64]
    const results = []

    for (const px of sizes) {
      const resized = await sharp(imageBuffer)
        .resize(px, px, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer()

      const faviconPath = `${projectId}/${logoId}/favicon-${px}.png`
      await uploadImage('logos', faviconPath, resized.toString('base64'))

      results.push({
        px,
        image_path: getPublicUrl('logos', faviconPath),
        readable: px >= 32, // Simple heuristic; Claude can assess more precisely
      })
    }

    // Update logo record
    const faviconTest = { sizes: results }
    await supabase.from('logos').update({ favicon_test: faviconTest }).eq('id', logoId)

    res.status(200).json(faviconTest)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
