import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { token } = req.query

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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
