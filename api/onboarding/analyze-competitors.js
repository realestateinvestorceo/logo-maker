import { callClaudeWithTool } from '../_lib/claude.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { images } = req.body

    if (!images || images.length < 2) {
      return res.status(400).json({ error: 'At least 2 competitor logo images are required' })
    }

    const imageContent = images.map((img, i) => ([
      {
        type: 'image',
        source: { type: 'base64', media_type: img.mediaType || 'image/png', data: img.base64 },
      },
      { type: 'text', text: `Competitor ${i + 1}: ${img.name || 'Unknown'}` },
    ])).flat()

    const result = await callClaudeWithTool({
      system: `You are an expert brand strategist analyzing a competitive landscape of logos. Identify patterns, trends, and opportunities for differentiation.`,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `Analyze these ${images.length} competitor logos and map the visual landscape. Identify: common colors, icon styles, typography trends, layout patterns, and opportunities to differentiate.`,
            },
          ],
        },
      ],
      tool: {
        name: 'map_competitive_landscape',
        description: 'Map the visual landscape of competitor logos',
        input_schema: {
          type: 'object',
          properties: {
            colors: { type: 'array', items: { type: 'string' }, description: 'Common colors used across competitors' },
            icon_styles: { type: 'array', items: { type: 'string' }, description: 'Common icon/symbol approaches' },
            typography: { type: 'array', items: { type: 'string' }, description: 'Typography trends and patterns' },
            layout_patterns: { type: 'array', items: { type: 'string' }, description: 'Common layout approaches' },
            opportunities: { type: 'array', items: { type: 'string' }, description: 'Opportunities to differentiate' },
            avoid: { type: 'array', items: { type: 'string' }, description: 'Things to avoid (too common in the space)' },
            summary: { type: 'string', description: 'Brief summary of the competitive landscape' },
          },
          required: ['colors', 'icon_styles', 'typography', 'layout_patterns', 'opportunities'],
        },
      },
    })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
