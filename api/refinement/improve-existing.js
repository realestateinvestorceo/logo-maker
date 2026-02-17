import { callClaudeWithVision } from '../_lib/claude.js'
import { generateImage } from '../_lib/imagen.js'
import { uploadImage, getPublicUrl } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'
import crypto from 'crypto'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, imageBase64, analysis } = req.body

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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
