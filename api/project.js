import { supabase } from './_lib/supabase.js'

export default async function handler(req, res) {
  try {
    const action = req.query.action || req.body?.action

    if (action === 'get' && req.method === 'GET') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Project ID is required' })

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    if (action === 'create') {
      const { name } = req.body
      if (!name) return res.status(400).json({ error: 'Project name is required' })

      const { data, error } = await supabase
        .from('projects')
        .insert({ name, company_brief: {} })
        .select()
        .single()

      if (error) throw error
      return res.status(200).json(data)
    }

    if (action === 'update') {
      const { id, ...updates } = req.body
      delete updates.action
      if (!id) return res.status(400).json({ error: 'Project ID is required' })

      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json(data)
    }

    return res.status(400).json({ error: 'Invalid action. Use: create, get, update' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
