import { generateImage } from '../_lib/imagen.js'
import { uploadImage, getPublicUrl } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'
import crypto from 'crypto'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, directionId, prompt, styleLevers, parentLogoId, generationType = 'initial', refinementInstruction } = req.body

    if (!projectId || !prompt) {
      return res.status(400).json({ error: 'Project ID and prompt are required' })
    }

    const logoId = crypto.randomUUID()

    // Generate image with Imagen 3
    const images = await generateImage(prompt, {
      sampleCount: 1,
      aspectRatio: '1:1',
    })

    if (!images || images.length === 0) {
      throw new Error('Imagen 3 returned no images')
    }

    const imageData = images[0]

    // Upload to Supabase Storage
    const storagePath = `${projectId}/${logoId}/original.png`
    await uploadImage('logos', storagePath, imageData.base64, imageData.mimeType)

    const publicUrl = getPublicUrl('logos', storagePath)

    // Calculate branch depth
    let branchDepth = 0
    if (parentLogoId) {
      const { data: parent } = await supabase
        .from('logos')
        .select('branch_depth')
        .eq('id', parentLogoId)
        .single()
      branchDepth = (parent?.branch_depth || 0) + 1
    }

    // Insert logo record
    const { data: logo, error } = await supabase
      .from('logos')
      .insert({
        id: logoId,
        project_id: projectId,
        direction_id: directionId || null,
        parent_logo_id: parentLogoId || null,
        storage_path: publicUrl,
        prompt,
        style_levers: styleLevers || {},
        generation_type: generationType,
        refinement_instruction: refinementInstruction || null,
        branch_depth: branchDepth,
      })
      .select()
      .single()

    if (error) throw error

    res.status(200).json(logo)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
