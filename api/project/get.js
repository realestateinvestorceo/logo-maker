import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { id } = req.query

    if (!id) return res.status(400).json({ error: 'Project ID is required' })

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
