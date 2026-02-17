import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import BossHeader from '../components/boss-review/BossHeader'
import BossLogoGrid from '../components/boss-review/BossLogoGrid'
import BossShortlistFilter from '../components/boss-review/BossShortlistFilter'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function BossReviewPage() {
  const { shareToken } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all | starred | approved
  const [feedback, setFeedback] = useState({}) // { [logoId]: { reaction, comment } }

  useEffect(() => {
    loadReview()
  }, [shareToken])

  const loadReview = async () => {
    try {
      const result = await api.getReview(shareToken)
      setData(result)

      // Build feedback map from existing feedback
      const fb = {}
      result.feedback?.forEach((f) => {
        if (!fb[f.logo_id]) fb[f.logo_id] = {}
        if (f.reaction) fb[f.logo_id].reaction = f.reaction
        if (f.comment) fb[f.logo_id].comment = f.comment
      })
      setFeedback(fb)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (logoId, reaction, comment, reviewerName) => {
    try {
      await api.submitFeedback({
        projectId: data.project.id,
        logoId,
        reaction,
        comment,
        reviewerName,
      })

      setFeedback((prev) => ({
        ...prev,
        [logoId]: { ...prev[logoId], reaction, comment },
      }))
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Review Not Found</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const logos = data?.logos || []
  const filteredLogos = logos.filter((logo) => {
    if (filter === 'starred') return feedback[logo.id]?.reaction === 'star'
    if (filter === 'approved') return feedback[logo.id]?.reaction === 'thumbs_up'
    return true
  })

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BossHeader project={data.project} />

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Logo Concepts ({filteredLogos.length})
          </h2>
          <BossShortlistFilter filter={filter} onChange={setFilter} />
        </div>

        <div className="mt-6">
          <BossLogoGrid
            logos={filteredLogos}
            feedback={feedback}
            onFeedback={handleFeedback}
          />
        </div>

        {data.project.competitor_analysis && (
          <div className="mt-12 bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Competitive Landscape</h3>
            <p className="text-sm text-gray-600">
              {data.project.competitor_analysis.summary || 'Competitor analysis data available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
