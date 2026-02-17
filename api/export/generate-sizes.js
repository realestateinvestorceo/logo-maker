import sharp from 'sharp'
import { downloadAsBase64, uploadImage, getPublicUrl } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'

const SIZES = [16, 32, 48, 64, 128, 256, 512, 1024]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, logoId } = req.body

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

    // Generate PNGs at all sizes
    const pngs = []
    for (const size of SIZES) {
      const resized = await sharp(imageBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer()

      const path = `${projectId}/${logoId}/export-${size}.png`
      await uploadImage('exports', path, resized.toString('base64'))
      pngs.push({ size, path: getPublicUrl('exports', path) })
    }

    // Light background version
    const lightBg = await sharp({
      create: { width: 1024, height: 1024, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([{
        input: await sharp(imageBuffer).resize(900, 900, { fit: 'contain' }).toBuffer(),
        gravity: 'center',
      }])
      .png()
      .toBuffer()

    const lightPath = `${projectId}/${logoId}/export-light-bg.png`
    await uploadImage('exports', lightPath, lightBg.toString('base64'))

    // Dark background version
    const darkBg = await sharp({
      create: { width: 1024, height: 1024, channels: 3, background: { r: 34, g: 34, b: 34 } },
    })
      .composite([{
        input: await sharp(imageBuffer).resize(900, 900, { fit: 'contain' }).toBuffer(),
        gravity: 'center',
      }])
      .png()
      .toBuffer()

    const darkPath = `${projectId}/${logoId}/export-dark-bg.png`
    await uploadImage('exports', darkPath, darkBg.toString('base64'))

    const result = {
      pngs,
      light_bg_path: getPublicUrl('exports', lightPath),
      dark_bg_path: getPublicUrl('exports', darkPath),
    }

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
