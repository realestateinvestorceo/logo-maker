import { callClaudeWithVision } from '../_lib/claude.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { imageBase64, mediaType } = req.body

    if (!imageBase64) return res.status(400).json({ error: 'Image data is required' })

    const result = await callClaudeWithVision({
      system: `You are an expert logo designer and brand strategist. Analyze the provided logo image across five dimensions. Be specific and actionable in your feedback. Each score should be 0-100 with a clear rationale.`,
      textPrompt: `Analyze this existing logo across these five dimensions:
1. Memorability - Would you recognize it after one glance?
2. Scalability - Does it work at 16px and on a billboard?
3. Relevance - Does it communicate the right industry/feeling?
4. Uniqueness - Does it avoid cliche and differentiate from competitors?
5. Simplicity - Could you sketch it from memory?

Also provide 3-5 specific, actionable weaknesses that should be addressed in a redesign.`,
      imageBase64,
      mediaType: mediaType || 'image/png',
      tool: {
        name: 'analyze_logo',
        description: 'Analyze a logo across 5 design dimensions',
        input_schema: {
          type: 'object',
          properties: {
            memorability: {
              type: 'object',
              properties: { score: { type: 'integer' }, rationale: { type: 'string' } },
              required: ['score', 'rationale'],
            },
            scalability: {
              type: 'object',
              properties: { score: { type: 'integer' }, rationale: { type: 'string' } },
              required: ['score', 'rationale'],
            },
            relevance: {
              type: 'object',
              properties: { score: { type: 'integer' }, rationale: { type: 'string' } },
              required: ['score', 'rationale'],
            },
            uniqueness: {
              type: 'object',
              properties: { score: { type: 'integer' }, rationale: { type: 'string' } },
              required: ['score', 'rationale'],
            },
            simplicity: {
              type: 'object',
              properties: { score: { type: 'integer' }, rationale: { type: 'string' } },
              required: ['score', 'rationale'],
            },
            actionable_weaknesses: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific, actionable weaknesses to address',
            },
          },
          required: ['memorability', 'scalability', 'relevance', 'uniqueness', 'simplicity', 'actionable_weaknesses'],
        },
      },
    })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
