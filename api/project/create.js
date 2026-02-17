import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { name } = req.body

    if (!name) return res.status(400).json({ error: 'Project name is required' })

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, company_brief: {} })
      .select()
      .single()

    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
