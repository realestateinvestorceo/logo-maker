import { supabase } from '../_lib/supabase.js'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { projectId } = req.body

    // Get all ungraded logos
    const { data: logos, error } = await supabase
      .from('logos')
      .select('id')
      .eq('project_id', projectId)
      .is('scores', null)
      .eq('is_archived', false)

    if (error) throw error

    // Grade each logo by calling the grade-logo endpoint internally
    const grades = []
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    for (const logo of logos) {
      try {
        const response = await fetch(`${baseUrl}/api/grading/grade-logo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoId: logo.id, projectId }),
        })

        if (response.ok) {
          const result = await response.json()
          grades.push(result)
        }
      } catch (gradeErr) {
        console.error(`Failed to grade logo ${logo.id}:`, gradeErr.message)
      }
    }

    res.status(200).json({ grades, total: logos.length, graded: grades.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
