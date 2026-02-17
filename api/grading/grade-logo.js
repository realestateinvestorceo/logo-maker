import { callClaudeWithVision } from '../_lib/claude.js'
import { downloadAsBase64 } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { logoId, projectId } = req.body

    // Get logo and project
    const [{ data: logo }, { data: project }] = await Promise.all([
      supabase.from('logos').select('*').eq('id', logoId).single(),
      supabase.from('projects').select('company_brief').eq('id', projectId).single(),
    ])

    if (!logo) throw new Error('Logo not found')

    // Download logo image
    const url = new URL(logo.storage_path)
    const pathMatch = url.pathname.match(/\/logos\/(.+)/)
    const imageBase64 = pathMatch ? await downloadAsBase64('logos', pathMatch[1]) : null

    if (!imageBase64) throw new Error('Could not download logo image')

    const scores = await callClaudeWithVision({
      system: `You are an expert logo critic. Grade this logo objectively across 5 dimensions, each scored 0-100. Consider the company context provided. Be honest and constructive — do not inflate scores. A score of 50 is average, 70+ is good, 80+ is excellent.`,
      textPrompt: `Grade this logo for: ${project?.company_brief?.company_name || 'Unknown Company'} (${project?.company_brief?.industry || 'Unknown Industry'})

Company brief: ${JSON.stringify(project?.company_brief || {})}

Score across: Memorability, Scalability, Relevance, Uniqueness, Simplicity. Then provide a composite score (weighted average) and a one-line summary.`,
      imageBase64,
      tool: {
        name: 'grade_logo',
        description: 'Grade a logo across 5 dimensions',
        input_schema: {
          type: 'object',
          properties: {
            memorability: { type: 'object', properties: { score: { type: 'integer' }, rationale: { type: 'string' } }, required: ['score', 'rationale'] },
            scalability: { type: 'object', properties: { score: { type: 'integer' }, rationale: { type: 'string' } }, required: ['score', 'rationale'] },
            relevance: { type: 'object', properties: { score: { type: 'integer' }, rationale: { type: 'string' } }, required: ['score', 'rationale'] },
            uniqueness: { type: 'object', properties: { score: { type: 'integer' }, rationale: { type: 'string' } }, required: ['score', 'rationale'] },
            simplicity: { type: 'object', properties: { score: { type: 'integer' }, rationale: { type: 'string' } }, required: ['score', 'rationale'] },
            composite: { type: 'integer', description: 'Weighted average composite score' },
            summary: { type: 'string', description: 'One-line summary of the logo quality' },
          },
          required: ['memorability', 'scalability', 'relevance', 'uniqueness', 'simplicity', 'composite', 'summary'],
        },
      },
    })

    // Update logo with scores
    const { error } = await supabase
      .from('logos')
      .update({ scores })
      .eq('id', logoId)

    if (error) throw error

    res.status(200).json({ logoId, scores })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
