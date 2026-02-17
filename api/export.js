import sharp from 'sharp'
import PDFDocument from 'pdfkit'
import { callClaudeWithVision } from './_lib/claude.js'
import { downloadAsBase64, uploadImage, getPublicUrl } from './_lib/storage.js'
import { supabase } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const action = req.query.action || req.body?.action

    if (action === 'generate-sizes') return handleGenerateSizes(req.body, res)
    if (action === 'generate-brand-kit') return handleGenerateBrandKit(req.body, res)
    if (action === 'generate-brand-pdf') return handleGenerateBrandPdf(req.body, res)

    return res.status(400).json({ error: 'Invalid action. Use: generate-sizes, generate-brand-kit, generate-brand-pdf' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const SIZES = [16, 32, 48, 64, 128, 256, 512, 1024]

async function getLogoImageBase64(logoStoragePath) {
  const url = new URL(logoStoragePath)
  const pathMatch = url.pathname.match(/\/logos\/(.+)/)
  if (pathMatch) return downloadAsBase64('logos', pathMatch[1])
  return null
}

async function handleGenerateSizes(body, res) {
  const { projectId, logoId } = body

  const { data: logo } = await supabase
    .from('logos')
    .select('storage_path')
    .eq('id', logoId)
    .single()

  if (!logo) throw new Error('Logo not found')

  const imageBase64 = await getLogoImageBase64(logo.storage_path)
  if (!imageBase64) throw new Error('Could not download logo')

  const imageBuffer = Buffer.from(imageBase64, 'base64')

  // Generate PNGs at all sizes
  const pngs = []
  for (const size of SIZES) {
    const resized = await sharp(imageBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer()

    const path = `${projectId}/${logoId}/export-${size}.png`
    await uploadImage('exports', path, resized.toString('base64'))
    pngs.push({ size, path: getPublicUrl('exports', path) })
  }

  // Light background version
  const lightBg = await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{
      input: await sharp(imageBuffer).resize(900, 900, { fit: 'contain' }).toBuffer(),
      gravity: 'center',
    }])
    .png()
    .toBuffer()

  const lightPath = `${projectId}/${logoId}/export-light-bg.png`
  await uploadImage('exports', lightPath, lightBg.toString('base64'))

  // Dark background version
  const darkBg = await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: { r: 34, g: 34, b: 34 } },
  })
    .composite([{
      input: await sharp(imageBuffer).resize(900, 900, { fit: 'contain' }).toBuffer(),
      gravity: 'center',
    }])
    .png()
    .toBuffer()

  const darkPath = `${projectId}/${logoId}/export-dark-bg.png`
  await uploadImage('exports', darkPath, darkBg.toString('base64'))

  const result = {
    pngs,
    light_bg_path: getPublicUrl('exports', lightPath),
    dark_bg_path: getPublicUrl('exports', darkPath),
  }

  res.status(200).json(result)
}

async function handleGenerateBrandKit(body, res) {
  const { projectId, logoId } = body

  const [{ data: logo }, { data: project }] = await Promise.all([
    supabase.from('logos').select('*').eq('id', logoId).single(),
    supabase.from('projects').select('*').eq('id', projectId).single(),
  ])

  if (!logo) throw new Error('Logo not found')

  const imageBase64 = await getLogoImageBase64(logo.storage_path)

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
}

async function handleGenerateBrandPdf(body, res) {
  const { projectId, logoId, brandKit } = body

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  const { data: logo } = await supabase
    .from('logos')
    .select('storage_path')
    .eq('id', logoId)
    .single()

  const logoBase64 = await getLogoImageBase64(logo.storage_path)

  // Generate PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks = []

  doc.on('data', (chunk) => chunks.push(chunk))

  await new Promise((resolve) => {
    doc.on('end', resolve)

    const brief = project?.company_brief || {}

    // Title
    doc.fontSize(28).font('Helvetica-Bold').text(brief.company_name || 'Brand Guide', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).font('Helvetica').fillColor('#666666').text('Brand Identity Summary', { align: 'center' })
    doc.moveDown(2)

    // Logo
    if (logoBase64) {
      const logoBuffer = Buffer.from(logoBase64, 'base64')
      doc.image(logoBuffer, { fit: [200, 200], align: 'center' })
      doc.moveDown(2)
    }

    // Color Palette
    if (brandKit?.colorPalette) {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Color Palette')
      doc.moveDown(0.5)

      brandKit.colorPalette.forEach((color) => {
        doc.fontSize(11).font('Helvetica')
          .fillColor('#333333')
          .text(`${color.name}: ${color.hex}`)
      })
      doc.moveDown(1)
    }

    // Typography
    if (brandKit?.fontIdentification) {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Typography')
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica').fillColor('#333333')
      if (brandKit.fontIdentification.primary) {
        doc.text(`Primary: ${brandKit.fontIdentification.primary}`)
      }
      if (brandKit.fontIdentification.secondary) {
        doc.text(`Secondary: ${brandKit.fontIdentification.secondary}`)
      }
      doc.moveDown(1)
    }

    // Usage Guidelines
    if (brandKit?.usageGuidelines) {
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Usage Guidelines')
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica').fillColor('#333333').text(brandKit.usageGuidelines)
      doc.moveDown(1)
    }

    // Brand Brief
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Brand Brief')
    doc.moveDown(0.5)
    doc.fontSize(11).font('Helvetica').fillColor('#333333')

    if (brief.industry) doc.text(`Industry: ${brief.industry}`)
    if (brief.target_audience) doc.text(`Audience: ${brief.target_audience}`)
    if (brief.tone) doc.text(`Tone: ${brief.tone}`)
    if (brief.values) doc.text(`Values: ${brief.values.join(', ')}`)

    doc.moveDown(2)
    doc.fontSize(8).fillColor('#999999').text('Generated by Logo Explorer', { align: 'center' })

    doc.end()
  })

  const pdfBuffer = Buffer.concat(chunks)
  const pdfPath = `${projectId}/${logoId}/brand-summary.pdf`
  await uploadImage('exports', pdfPath, pdfBuffer.toString('base64'), 'application/pdf')

  res.status(200).json({
    path: getPublicUrl('exports', pdfPath),
  })
}
