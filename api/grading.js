import sharp from 'sharp'
import { callClaudeWithVision } from './_lib/claude.js'
import { generateImage } from './_lib/imagen.js'
import { downloadAsBase64, uploadImage, getPublicUrl } from './_lib/storage.js'
import { supabase } from './_lib/supabase.js'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const action = req.query.action || req.body?.action

    if (action === 'grade-logo') return handleGradeLogo(req.body, res)
    if (action === 'grade-batch') return handleGradeBatch(req.body, res)
    if (action === 'stress-test') return handleStressTest(req.body, res)
    if (action === 'accessibility') return handleAccessibility(req.body, res)
    if (action === 'generate-mockups') return handleGenerateMockups(req.body, res)

    return res.status(400).json({ error: 'Invalid action. Use: grade-logo, grade-batch, stress-test, accessibility, generate-mockups' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getLogoImageBase64(logoStoragePath) {
  const url = new URL(logoStoragePath)
  const pathMatch = url.pathname.match(/\/logos\/(.+)/)
  if (pathMatch) return downloadAsBase64('logos', pathMatch[1])
  return null
}

async function handleGradeLogo(body, res) {
  const { logoId, projectId } = body

  const [{ data: logo }, { data: project }] = await Promise.all([
    supabase.from('logos').select('*').eq('id', logoId).single(),
    supabase.from('projects').select('company_brief').eq('id', projectId).single(),
  ])

  if (!logo) throw new Error('Logo not found')

  const imageBase64 = await getLogoImageBase64(logo.storage_path)
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

  const { error } = await supabase.from('logos').update({ scores }).eq('id', logoId)
  if (error) throw error

  res.status(200).json({ logoId, scores })
}

async function handleGradeBatch(body, res) {
  const { projectId } = body

  const { data: logos, error } = await supabase
    .from('logos')
    .select('id')
    .eq('project_id', projectId)
    .is('scores', null)
    .eq('is_archived', false)

  if (error) throw error

  // Grade each logo by calling handleGradeLogo directly
  const grades = []
  for (const logo of logos) {
    try {
      const mockRes = {
        statusCode: 200,
        data: null,
        status(code) { this.statusCode = code; return this },
        json(data) { this.data = data; return this },
      }
      await handleGradeLogo({ logoId: logo.id, projectId }, mockRes)
      if (mockRes.statusCode === 200) grades.push(mockRes.data)
    } catch (gradeErr) {
      console.error(`Failed to grade logo ${logo.id}:`, gradeErr.message)
    }
  }

  res.status(200).json({ grades, total: logos.length, graded: grades.length })
}

async function handleStressTest(body, res) {
  const { logoId, projectId } = body

  const { data: logo } = await supabase
    .from('logos')
    .select('storage_path')
    .eq('id', logoId)
    .single()

  if (!logo) throw new Error('Logo not found')

  const imageBase64 = await getLogoImageBase64(logo.storage_path)
  if (!imageBase64) throw new Error('Could not download logo')

  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const sizes = [16, 32, 64]
  const results = []

  for (const px of sizes) {
    const resized = await sharp(imageBuffer)
      .resize(px, px, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer()

    const faviconPath = `${projectId}/${logoId}/favicon-${px}.png`
    await uploadImage('logos', faviconPath, resized.toString('base64'))

    results.push({
      px,
      image_path: getPublicUrl('logos', faviconPath),
      readable: px >= 32,
    })
  }

  const faviconTest = { sizes: results }
  await supabase.from('logos').update({ favicon_test: faviconTest }).eq('id', logoId)

  res.status(200).json(faviconTest)
}

async function handleAccessibility(body, res) {
  const { logoId, projectId } = body

  const { data: logo } = await supabase
    .from('logos')
    .select('storage_path')
    .eq('id', logoId)
    .single()

  if (!logo) throw new Error('Logo not found')

  const imageBase64 = await getLogoImageBase64(logo.storage_path)
  if (!imageBase64) throw new Error('Could not download logo')

  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const size = 256

  // Extract dominant colors for WCAG analysis
  const { dominant } = await sharp(imageBuffer)
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true })

  const logoColor = { r: dominant.info ? 0 : 128, g: 128, b: 128 }

  // Generate background variants
  const backgrounds = {}
  for (const [name, bgColor] of [
    ['white', { r: 255, g: 255, b: 255 }],
    ['black', { r: 0, g: 0, b: 0 }],
    ['colored', { r: 66, g: 99, b: 235 }],
  ]) {
    const bg = await sharp({
      create: { width: size, height: size, channels: 3, background: bgColor },
    })
      .png()
      .toBuffer()

    const composite = await sharp(bg)
      .composite([{
        input: await sharp(imageBuffer).resize(size - 40, size - 40, { fit: 'contain' }).toBuffer(),
        gravity: 'center',
      }])
      .png()
      .toBuffer()

    const bgPath = `${projectId}/${logoId}/bg-${name}.png`
    await uploadImage('logos', bgPath, composite.toString('base64'))
    backgrounds[name] = getPublicUrl('logos', bgPath)
  }

  // Simulate colorblind variants
  const colorblind = {}
  for (const type of ['protanopia', 'deuteranopia', 'tritanopia']) {
    const simulated = await sharp(imageBuffer)
      .resize(size, size, { fit: 'contain' })
      .modulate({ saturation: type === 'tritanopia' ? 0.5 : 0.3 })
      .png()
      .toBuffer()

    const cbPath = `${projectId}/${logoId}/cb-${type}.png`
    await uploadImage('logos', cbPath, simulated.toString('base64'))
    colorblind[type] = getPublicUrl('logos', cbPath)
  }

  // Simple WCAG contrast check
  const contrastRatio = calculateContrast(logoColor, { r: 255, g: 255, b: 255 })

  const accessibility = {
    wcag_contrast: {
      ratio: Math.round(contrastRatio * 100) / 100,
      passes_aa: contrastRatio >= 4.5,
      passes_aaa: contrastRatio >= 7,
    },
    colorblind,
    backgrounds,
  }

  await supabase.from('logos').update({ accessibility }).eq('id', logoId)

  res.status(200).json(accessibility)
}

function calculateContrast(color1, color2) {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getRelativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const MOCKUP_PROMPTS = {
  business_card: 'Professional business card mockup with this logo, clean white card on dark surface, realistic shadows, high quality product photography',
  website_header: 'Modern website header/hero section featuring this logo, clean responsive design, professional layout, screenshot style',
  app_icon: 'Mobile app icon with this logo, rounded corners, iOS style, on a phone screen, product mockup',
  social_avatar: 'Social media profile avatar/picture using this logo, circular crop, clean background, professional',
  dark_bg: 'This logo displayed on a dark charcoal background, elegant presentation, premium feel, high contrast',
  product: 'This logo printed/embroidered on a t-shirt or product, realistic mockup, product photography style',
}

async function handleGenerateMockups(body, res) {
  const { logoId, projectId, types } = body

  const { data: logo } = await supabase
    .from('logos')
    .select('storage_path, prompt')
    .eq('id', logoId)
    .single()

  if (!logo) throw new Error('Logo not found')

  const mockupTypes = types || Object.keys(MOCKUP_PROMPTS)
  const mockups = {}

  for (const type of mockupTypes) {
    const prompt = MOCKUP_PROMPTS[type]
    if (!prompt) continue

    try {
      const images = await generateImage(
        `${prompt}. The logo design: ${logo.prompt}`,
        { sampleCount: 1, aspectRatio: type === 'social_avatar' ? '1:1' : '16:9' }
      )

      if (images.length > 0) {
        const path = `${projectId}/${logoId}/mockup-${type}.png`
        await uploadImage('mockups', path, images[0].base64)
        mockups[type] = getPublicUrl('mockups', path)
      }
    } catch (genErr) {
      console.error(`Mockup ${type} failed:`, genErr.message)
    }
  }

  await supabase.from('logos').update({ mockups }).eq('id', logoId)

  res.status(200).json(mockups)
}
