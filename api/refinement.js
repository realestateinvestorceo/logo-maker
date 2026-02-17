import { callClaudeWithVision } from './_lib/claude.js'
import { generateImage } from './_lib/imagen.js'
import { uploadImage, getPublicUrl, downloadAsBase64 } from './_lib/storage.js'
import { supabase } from './_lib/supabase.js'
import crypto from 'crypto'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const action = req.query.action || req.body?.action

    if (action === 'branch-variations') {
      return handleBranchVariations(req.body, res)
    }

    if (action === 'refine-logo') {
      return handleRefineLogo(req.body, res)
    }

    if (action === 'improve-existing') {
      return handleImproveExisting(req.body, res)
    }

    return res.status(400).json({ error: 'Invalid action. Use: branch-variations, refine-logo, improve-existing' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getLogoBase64(logo) {
  const url = new URL(logo.storage_path)
  const pathMatch = url.pathname.match(/\/logos\/(.+)/)
  if (pathMatch) {
    return downloadAsBase64('logos', pathMatch[1])
  }
  throw new Error('Could not resolve logo storage path')
}

async function handleBranchVariations(body, res) {
  const { projectId, logoId, instruction } = body

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
}

async function handleRefineLogo(body, res) {
  const { projectId, logoId, instruction } = body

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
}

async function handleImproveExisting(body, res) {
  const { projectId, imageBase64, analysis } = body

  if (!imageBase64) return res.status(400).json({ error: 'Image data is required' })

  // Get company brief
  const { data: project } = await supabase
    .from('projects')
    .select('company_brief')
    .eq('id', projectId)
    .single()

  // Ask Claude to create improvement prompts based on the analysis
  const improvements = await callClaudeWithVision({
    system: `You are an expert logo designer. Based on the analysis of weaknesses in this logo, create 4 improvement prompts that address the identified issues while keeping the brand identity.`,
    textPrompt: `This logo has these weaknesses: ${JSON.stringify(analysis?.actionable_weaknesses || [])}

Company: ${JSON.stringify(project?.company_brief || {})}

Create 4 Imagen 3 prompts that improve upon this logo, addressing the weaknesses while preserving brand recognition.`,
    imageBase64,
    tool: {
      name: 'create_improvements',
      description: 'Create improvement prompts for an existing logo',
      input_schema: {
        type: 'object',
        properties: {
          improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prompt_text: { type: 'string' },
                weakness_addressed: { type: 'string' },
              },
              required: ['prompt_text', 'weakness_addressed'],
            },
            minItems: 3,
            maxItems: 4,
          },
        },
        required: ['improvements'],
      },
    },
  })

  // Generate improved versions
  const logos = []
  for (const imp of improvements.improvements) {
    try {
      const images = await generateImage(imp.prompt_text, { sampleCount: 1 })
      if (images.length === 0) continue

      const logoId = crypto.randomUUID()
      const storagePath = `${projectId}/${logoId}/original.png`
      await uploadImage('logos', storagePath, images[0].base64)

      const { data: logo, error } = await supabase
        .from('logos')
        .insert({
          id: logoId,
          project_id: projectId,
          storage_path: getPublicUrl('logos', storagePath),
          prompt: imp.prompt_text,
          generation_type: 'improve',
          refinement_instruction: imp.weakness_addressed,
        })
        .select()
        .single()

      if (!error) logos.push(logo)
    } catch (genErr) {
      console.error('Improvement generation failed:', genErr.message)
    }
  }

  res.status(200).json({ logos })
}
