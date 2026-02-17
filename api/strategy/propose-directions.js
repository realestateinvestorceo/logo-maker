import { callClaudeWithTool } from '../_lib/claude.js'
import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, companyBrief, competitorAnalysis } = req.body

    const contextParts = [`Company Brief:\n${JSON.stringify(companyBrief, null, 2)}`]
    if (competitorAnalysis) {
      contextParts.push(`Competitor Analysis:\n${JSON.stringify(competitorAnalysis, null, 2)}`)
    }

    const result = await callClaudeWithTool({
      system: `You are an expert creative director for logo design. Based on the company brief and competitive analysis, propose 5-6 distinct creative directions for a logo. Each direction should be genuinely different and include a specific rationale tied to the company's brand. Cover a range of approaches: wordmark, abstract symbol, lettermark, mascot, negative space concept, and industry emblem.`,
      messages: [
        {
          role: 'user',
          content: `Propose 5-6 creative directions for a logo based on:\n\n${contextParts.join('\n\n')}`,
        },
      ],
      tool: {
        name: 'propose_directions',
        description: 'Propose creative directions for logo design',
        input_schema: {
          type: 'object',
          properties: {
            directions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['wordmark', 'abstract_symbol', 'lettermark', 'mascot', 'negative_space', 'emblem'] },
                  name: { type: 'string', description: 'Short creative name for this direction' },
                  rationale: { type: 'string', description: 'Why this direction fits the brand (2-3 sentences)' },
                  style_keywords: { type: 'array', items: { type: 'string' }, description: 'Style keywords' },
                  color_palette: {
                    type: 'object',
                    properties: {
                      colors: { type: 'array', items: { type: 'string' }, description: 'Suggested hex colors' },
                      description: { type: 'string' },
                    },
                  },
                },
                required: ['type', 'name', 'rationale'],
              },
              minItems: 5,
              maxItems: 6,
            },
          },
          required: ['directions'],
        },
      },
    })

    // Save directions to database
    const directions = result.directions.map((d, i) => ({
      project_id: projectId,
      type: d.type,
      name: d.name,
      rationale: d.rationale,
      style_keywords: d.style_keywords || [],
      color_palette: d.color_palette || null,
      sort_order: i,
    }))

    const { data, error } = await supabase
      .from('directions')
      .insert(directions)
      .select()

    if (error) throw error

    res.status(200).json({ directions: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
