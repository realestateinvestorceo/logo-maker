import { generateImage } from '../_lib/imagen.js'
import { downloadAsBase64, uploadImage, getPublicUrl } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'

export const config = { maxDuration: 120 }

const MOCKUP_PROMPTS = {
  business_card: 'Professional business card mockup with this logo, clean white card on dark surface, realistic shadows, high quality product photography',
  website_header: 'Modern website header/hero section featuring this logo, clean responsive design, professional layout, screenshot style',
  app_icon: 'Mobile app icon with this logo, rounded corners, iOS style, on a phone screen, product mockup',
  social_avatar: 'Social media profile avatar/picture using this logo, circular crop, clean background, professional',
  dark_bg: 'This logo displayed on a dark charcoal background, elegant presentation, premium feel, high contrast',
  product: 'This logo printed/embroidered on a t-shirt or product, realistic mockup, product photography style',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { logoId, projectId, types } = req.body

    const { data: logo } = await supabase
      .from('logos')
      .select('storage_path, prompt')
      .eq('id', logoId)
      .single()

    if (!logo) throw new Error('Logo not found')

    const mockupTypes = types || Object.keys(MOCKUP_PROMPTS)
    const mockups = {}

    for (const type of mockupTypes) {
      const prompt = MOCKUP_PROMPTS[type]
      if (!prompt) continue

      try {
        const images = await generateImage(
          `${prompt}. The logo design: ${logo.prompt}`,
          { sampleCount: 1, aspectRatio: type === 'social_avatar' ? '1:1' : '16:9' }
        )

        if (images.length > 0) {
          const path = `${projectId}/${logoId}/mockup-${type}.png`
          await uploadImage('mockups', path, images[0].base64)
          mockups[type] = getPublicUrl('mockups', path)
        }
      } catch (genErr) {
        console.error(`Mockup ${type} failed:`, genErr.message)
      }
    }

    await supabase.from('logos').update({ mockups }).eq('id', logoId)

    res.status(200).json(mockups)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
