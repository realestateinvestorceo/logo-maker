import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId, logoId, reaction, comment, reviewerName } = req.body

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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
