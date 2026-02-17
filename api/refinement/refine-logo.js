import { callClaudeWithVision } from '../_lib/claude.js'
import { generateImage } from '../_lib/imagen.js'
import { uploadImage, getPublicUrl, downloadAsBase64 } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'
import crypto from 'crypto'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, logoId, instruction } = req.body

    if (!instruction) return res.status(400).json({ error: 'Instruction is required' })

    // Get the source logo
    const { data: sourceLogo, error: logoErr } = await supabase
      .from('logos')
      .select('*')
      .eq('id', logoId)
      .single()

    if (logoErr || !sourceLogo) throw new Error('Source logo not found')

    // Get logo image
    const url = new URL(sourceLogo.storage_path)
    const pathMatch = url.pathname.match(/\/logos\/(.+)/)
    const imageBase64 = pathMatch ? await downloadAsBase64('logos', pathMatch[1]) : null

    // Ask Claude to translate the instruction into a precise Imagen prompt
    const refinedPrompt = await callClaudeWithVision({
      system: `You are an expert prompt engineer. Translate a natural language refinement instruction into a precise image generation prompt. The new prompt should produce a logo that matches the original but with the requested changes applied.`,
      textPrompt: `Original prompt: "${sourceLogo.prompt}"
User instruction: "${instruction}"

Create a new Imagen 3 prompt that generates a refined version of this logo with the requested changes. Keep the core concept but apply the modification.`,
      imageBase64,
      tool: {
        name: 'refine_prompt',
        description: 'Create a refined prompt based on user instruction',
        input_schema: {
          type: 'object',
          properties: {
            prompt_text: { type: 'string', description: 'The refined Imagen 3 prompt' },
            changes_applied: { type: 'string', description: 'Summary of changes applied' },
          },
          required: ['prompt_text', 'changes_applied'],
        },
      },
    })

    // Generate refined logo
    const images = await generateImage(refinedPrompt.prompt_text, { sampleCount: 1 })
    if (!images || images.length === 0) throw new Error('Generation returned no images')

    const newLogoId = crypto.randomUUID()
    const storagePath = `${projectId}/${newLogoId}/original.png`
    await uploadImage('logos', storagePath, images[0].base64)

    const { data: logo, error } = await supabase
      .from('logos')
      .insert({
        id: newLogoId,
        project_id: projectId,
        direction_id: sourceLogo.direction_id,
        parent_logo_id: logoId,
        storage_path: getPublicUrl('logos', storagePath),
        prompt: refinedPrompt.prompt_text,
        style_levers: sourceLogo.style_levers || {},
        generation_type: 'refine',
        refinement_instruction: instruction,
        branch_depth: (sourceLogo.branch_depth || 0) + 1,
      })
      .select()
      .single()

    if (error) throw error

    res.status(200).json({ logo })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
