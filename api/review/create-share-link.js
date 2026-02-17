import { supabase } from '../_lib/supabase.js'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId } = req.body

    const token = crypto.randomUUID()

    const { error } = await supabase
      .from('projects')
      .update({ share_token: token })
      .eq('id', projectId)

    if (error) throw error

    res.status(200).json({ token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
