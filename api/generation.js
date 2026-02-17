import { callClaudeWithTool } from './_lib/claude.js'
import { generateImage } from './_lib/imagen.js'
import { uploadImage, getPublicUrl } from './_lib/storage.js'
import { supabase } from './_lib/supabase.js'
import crypto from 'crypto'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const action = req.query.action || req.body?.action

    if (action === 'engineer-prompts') {
      return handleEngineerPrompts(req.body, res)
    }

    if (action === 'generate-logo') {
      return handleGenerateLogo(req.body, res)
    }

    return res.status(400).json({ error: 'Invalid action. Use: engineer-prompts, generate-logo' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function handleEngineerPrompts(body, res) {
  const { directions, companyBrief } = body

  if (!directions || directions.length === 0) {
    return res.status(400).json({ error: 'At least one direction is required' })
  }

  const result = await callClaudeWithTool({
    system: `You are an expert prompt engineer for AI image generation (Imagen 3). Create detailed, specific prompts that will generate professional logo designs. Each prompt should specify: the logo concept, style (flat/3D/hand-drawn/geometric), color palette, composition, and any typography details. Be very specific about visual details. Always include "professional logo design, vector style, clean white background, high contrast" in your prompts for consistent logo-quality output.`,
    messages: [
      {
        role: 'user',
        content: `Create 3-4 Imagen 3 prompts for each of these selected creative directions. Vary the style, color, and composition across prompts for each direction.

Company Brief: ${JSON.stringify(companyBrief)}

Directions:
${directions.map((d, i) => `${i + 1}. ${d.name} (${d.type}): ${d.rationale}`).join('\n')}`,
      },
    ],
    tool: {
      name: 'engineer_prompts',
      description: 'Generate Imagen 3 prompts for logo creation',
      input_schema: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                direction_id: { type: 'string', description: 'ID of the direction this prompt belongs to' },
                direction_name: { type: 'string' },
                prompt_text: { type: 'string', description: 'Full Imagen 3 prompt' },
                style_levers: {
                  type: 'object',
                  properties: {
                    style: { type: 'string' },
                    palette: { type: 'string' },
                    composition: { type: 'string' },
                    mood: { type: 'string' },
                  },
                },
              },
              required: ['direction_name', 'prompt_text', 'style_levers'],
            },
          },
        },
        required: ['prompts'],
      },
    },
  })

  // Map direction names back to IDs
  const prompts = result.prompts.map((p) => {
    const matchedDir = directions.find(
      (d) => d.name === p.direction_name || d.id === p.direction_id
    )
    return {
      ...p,
      direction_id: matchedDir?.id || p.direction_id,
    }
  })

  res.status(200).json({ prompts })
}

async function handleGenerateLogo(body, res) {
  const { projectId, directionId, prompt, styleLevers, parentLogoId, generationType = 'initial', refinementInstruction } = body

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
}
