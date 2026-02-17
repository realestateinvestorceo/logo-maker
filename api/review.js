import { supabase } from './_lib/supabase.js'
import crypto from 'crypto'

export default async function handler(req, res) {
  try {
    const action = req.query.action

    if (action === 'get-review' && req.method === 'GET') {
      return handleGetReview(req.query, res)
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    if (action === 'create-share-link') {
      return handleCreateShareLink(req.body, res)
    }

    if (action === 'submit-feedback') {
      return handleSubmitFeedback(req.body, res)
    }

    return res.status(400).json({ error: 'Invalid action. Use: create-share-link, get-review, submit-feedback' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function handleCreateShareLink(body, res) {
  const { projectId } = body

  const token = crypto.randomUUID()

  const { error } = await supabase
    .from('projects')
    .update({ share_token: token })
    .eq('id', projectId)

  if (error) throw error

  res.status(200).json({ token })
}

async function handleGetReview(query, res) {
  const { token } = query

  if (!token) return res.status(400).json({ error: 'Token is required' })

  // Get project by share token
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('share_token', token)
    .single()

  if (projErr || !project) {
    return res.status(404).json({ error: 'Review not found' })
  }

  // Get all logos sorted by score
  const { data: logos } = await supabase
    .from('logos')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  // Sort by composite score (scored logos first)
  const sortedLogos = (logos || []).sort((a, b) => {
    const aScore = a.scores?.composite ?? -1
    const bScore = b.scores?.composite ?? -1
    return bScore - aScore
  })

  // Get existing feedback
  const { data: feedback } = await supabase
    .from('boss_feedback')
    .select('*')
    .eq('project_id', project.id)

  res.status(200).json({
    project,
    logos: sortedLogos,
    feedback: feedback || [],
  })
}

async function handleSubmitFeedback(body, res) {
  const { projectId, logoId, reaction, comment, reviewerName } = body

  if (!projectId || !logoId) {
    return res.status(400).json({ error: 'Project ID and Logo ID are required' })
  }

  const { data, error } = await supabase
    .from('boss_feedback')
    .insert({
      project_id: projectId,
      logo_id: logoId,
      reaction: reaction || null,
      comment: comment || null,
      reviewer_name: reviewerName || null,
    })
    .select()
    .single()

  if (error) throw error

  res.status(200).json(data)
}
