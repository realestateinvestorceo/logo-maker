import { callClaudeWithTool } from '../_lib/claude.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { text } = req.body

    if (!text) return res.status(400).json({ error: 'Text content is required' })

    const result = await callClaudeWithTool({
      system: `You are a brand strategist. Extract structured company information from the provided document text. Be thorough but accurate. If you cannot confidently extract a field, add it to the "gaps" array so the user can fill it in manually. Focus on information relevant to logo design and brand identity.`,
      messages: [
        {
          role: 'user',
          content: `Extract company information from this document for logo design purposes:\n\n${text.slice(0, 15000)}`,
        },
      ],
      tool: {
        name: 'extract_company_data',
        description: 'Extract structured company data for logo design',
        input_schema: {
          type: 'object',
          properties: {
            company_name: { type: 'string', description: 'Company or brand name' },
            industry: { type: 'string', description: 'Industry or sector' },
            target_audience: { type: 'string', description: 'Primary target audience' },
            mission_statement: { type: 'string', description: 'Mission or purpose' },
            values: { type: 'array', items: { type: 'string' }, description: 'Core brand values' },
            tone: { type: 'string', description: 'Brand personality and tone (e.g., professional, playful, bold)' },
            color_preferences: { type: 'array', items: { type: 'string' }, description: 'Preferred colors or color families' },
            differentiators: { type: 'array', items: { type: 'string' }, description: 'Key differentiators from competitors' },
            gaps: { type: 'array', items: { type: 'string' }, description: 'Information that could not be found and should be asked' },
          },
          required: ['company_name', 'industry', 'gaps'],
        },
      },
    })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
