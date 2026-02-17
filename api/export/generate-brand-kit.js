import { callClaudeWithVision } from '../_lib/claude.js'
import { downloadAsBase64 } from '../_lib/storage.js'
import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, logoId } = req.body

    const [{ data: logo }, { data: project }] = await Promise.all([
      supabase.from('logos').select('*').eq('id', logoId).single(),
      supabase.from('projects').select('*').eq('id', projectId).single(),
    ])

    if (!logo) throw new Error('Logo not found')

    // Download logo for analysis
    const url = new URL(logo.storage_path)
    const pathMatch = url.pathname.match(/\/logos\/(.+)/)
    const imageBase64 = pathMatch ? await downloadAsBase64('logos', pathMatch[1]) : null

    // Ask Claude to identify fonts and extract color details
    const analysis = await callClaudeWithVision({
      system: `You are a brand identity expert. Analyze this logo to extract colors and identify any typography used.`,
      textPrompt: `Analyze this logo and extract:
1. The color palette (3-6 dominant colors with hex codes and descriptive names)
2. Font identification (if this is a wordmark or includes text, identify the font family or closest match)
3. Brief usage guidelines (1-2 sentences on where/how to use the logo)`,
      imageBase64,
      tool: {
        name: 'extract_brand_elements',
        description: 'Extract brand elements from the winning logo',
        input_schema: {
          type: 'object',
          properties: {
            colorPalette: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hex: { type: 'string' },
                },
                required: ['name', 'hex'],
              },
            },
            fontIdentification: {
              type: 'object',
              properties: {
                primary: { type: 'string', description: 'Primary font name or closest match' },
                secondary: { type: 'string', description: 'Secondary font if applicable' },
              },
            },
            usageGuidelines: { type: 'string' },
          },
          required: ['colorPalette'],
        },
      },
    })

    // Store brand kit
    const { data: exportPackage, error } = await supabase
      .from('export_packages')
      .insert({
        project_id: projectId,
        logo_id: logoId,
        assets: {
          ...analysis,
          scores: logo.scores,
          mockups: logo.mockups,
        },
      })
      .select()
      .single()

    if (error) throw error

    res.status(200).json({
      ...analysis,
      scores: logo.scores,
      mockup_paths: logo.mockups,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
