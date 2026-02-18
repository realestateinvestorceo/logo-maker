import pdf from 'pdf-parse/lib/pdf-parse.js'
import { callClaudeWithTool, callClaudeWithVision } from './_lib/claude.js'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  try {
    // For parse-pdf, we need raw body (multipart)
    // For other actions, we need JSON body
    // Detect via query param or content-type
    const action = req.query.action

    if (action === 'parse-pdf') {
      return handleParsePdf(req, res)
    }

    // Parse JSON body manually since bodyParser is disabled
    const body = await parseJsonBody(req)

    if (action === 'extract-company') {
      return handleExtractCompany(body, res)
    }

    if (action === 'analyze-logo') {
      return handleAnalyzeLogo(body, res)
    }

    if (action === 'analyze-competitors') {
      return handleAnalyzeCompetitors(body, res)
    }

    return res.status(400).json({ error: 'Invalid action. Use: parse-pdf, extract-company, analyze-logo, analyze-competitors' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function parseJsonBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(raw)
}

async function handleParsePdf(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const body = Buffer.concat(chunks)

  const boundary = req.headers['content-type']?.split('boundary=')[1]
  if (!boundary) {
    return res.status(400).json({ error: 'Missing multipart boundary' })
  }

  const bodyStr = body.toString('latin1')
  const parts = bodyStr.split(`--${boundary}`)
  let pdfBuffer = null

  for (const part of parts) {
    if (part.includes('application/pdf') || part.includes('.pdf')) {
      const headerEnd = part.indexOf('\r\n\r\n')
      if (headerEnd !== -1) {
        const content = part.slice(headerEnd + 4)
        const cleanContent = content.replace(/\r\n--$/, '').replace(/\r\n$/, '')
        pdfBuffer = Buffer.from(cleanContent, 'latin1')
      }
    }
  }

  if (!pdfBuffer) {
    return res.status(400).json({ error: 'No PDF file found in upload' })
  }

  const result = await pdf(pdfBuffer)

  res.status(200).json({
    text: result.text,
    pages: result.numpages,
    info: result.info,
  })
}

async function handleExtractCompany(body, res) {
  const { text } = body

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
}

async function handleAnalyzeLogo(body, res) {
  const { imageBase64, mediaType } = body

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
}

async function handleAnalyzeCompetitors(body, res) {
  const { images } = body

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
}
