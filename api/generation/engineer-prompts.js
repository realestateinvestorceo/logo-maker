import { callClaudeWithTool } from '../_lib/claude.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { directions, companyBrief } = req.body

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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
