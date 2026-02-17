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

    // Get the source logo
    const { data: sourceLogo, error: logoErr } = await supabase
      .from('logos')
      .select('*')
      .eq('id', logoId)
      .single()

    if (logoErr || !sourceLogo) throw new Error('Source logo not found')

    // Get company brief for context
    const { data: project } = await supabase
      .from('projects')
      .select('company_brief')
      .eq('id', projectId)
      .single()

    // Ask Claude to generate variation prompts
    const variationPrompts = await callClaudeWithVision({
      system: `You are an expert logo designer creating targeted variations of an existing logo concept. Generate 4-6 prompts that preserve the core concept but vary specific elements. Each variation should be meaningfully different.`,
      textPrompt: `Create 4-6 variation prompts for this logo. ${instruction ? `Focus on: ${instruction}` : 'Vary: color palette, typography weight, icon simplicity, composition, and mood.'}

Company context: ${JSON.stringify(project?.company_brief || {})}
Original prompt: ${sourceLogo.prompt}`,
      imageBase64: await getLogoBase64(sourceLogo),
      tool: {
        name: 'generate_variation_prompts',
        description: 'Generate variation prompts for logo branching',
        input_schema: {
          type: 'object',
          properties: {
            variations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prompt_text: { type: 'string' },
                  variation_type: { type: 'string', description: 'What was varied (e.g., palette, simplify, typography)' },
                  style_levers: {
                    type: 'object',
                    properties: {
                      style: { type: 'string' },
                      palette: { type: 'string' },
                      composition: { type: 'string' },
                    },
                  },
                },
                required: ['prompt_text', 'variation_type'],
              },
              minItems: 4,
              maxItems: 6,
            },
          },
          required: ['variations'],
        },
      },
    })

    // Generate each variation
    const logos = []
    for (const variation of variationPrompts.variations) {
      try {
        const images = await generateImage(variation.prompt_text, { sampleCount: 1 })
        if (images.length === 0) continue

        const newLogoId = crypto.randomUUID()
        const storagePath = `${projectId}/${newLogoId}/original.png`
        await uploadImage('logos', storagePath, images[0].base64)

        const { data: newLogo, error } = await supabase
          .from('logos')
          .insert({
            id: newLogoId,
            project_id: projectId,
            direction_id: sourceLogo.direction_id,
            parent_logo_id: logoId,
            storage_path: getPublicUrl('logos', storagePath),
            prompt: variation.prompt_text,
            style_levers: variation.style_levers || {},
            generation_type: 'branch',
            refinement_instruction: variation.variation_type,
            branch_depth: (sourceLogo.branch_depth || 0) + 1,
          })
          .select()
          .single()

        if (!error) logos.push(newLogo)
      } catch (genErr) {
        console.error('Variation generation failed:', genErr.message)
      }
    }

    res.status(200).json({ logos })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getLogoBase64(logo) {
  // Extract bucket path from public URL
  const url = new URL(logo.storage_path)
  const pathMatch = url.pathname.match(/\/logos\/(.+)/)
  if (pathMatch) {
    return downloadAsBase64('logos', pathMatch[1])
  }
  throw new Error('Could not resolve logo storage path')
}
