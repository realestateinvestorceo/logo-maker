import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useLogoStore } from '../stores/logoStore'
import { api } from '../lib/api'
import DirectionSelector from '../components/strategy/DirectionSelector'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function StrategyPage() {
  const [loading, setLoading] = useState(false)
  const [proposing, setProposing] = useState(false)
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)
  const directions = useLogoStore((s) => s.directions)
  const setDirections = useLogoStore((s) => s.setDirections)

  const selectedCount = directions.filter((d) => d.selected).length

  const handlePropose = async () => {
    if (!project?.company_brief) return
    setProposing(true)
    try {
      const result = await api.proposeDirections({
        projectId: project.id,
        companyBrief: project.company_brief,
        competitorAnalysis: project.competitor_analysis,
      })
      setDirections(result.directions)
    } catch (err) {
      console.error('Failed to propose directions:', err)
    } finally {
      setProposing(false)
    }
  }

  useEffect(() => {
    if (directions.length === 0 && project?.company_brief) {
      handlePropose()
    }
  }, [])

  const handleProceed = async () => {
    const selected = directions.filter((d) => d.selected)
    await updateProject({
      selected_directions: selected.map((d) => d.id),
      phase_progress: 3,
    })
    navigate('/generate')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Creative Strategy</h1>
        <p className="text-gray-500 mt-1">
          Claude has proposed creative directions based on your brand. Select 2-3 to explore.
        </p>
      </div>

      {proposing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Claude is analyzing your brand and proposing creative directions...</p>
        </div>
      ) : (
        <>
          <DirectionSelector />

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedCount} of {directions.length} directions selected
              {selectedCount < 2 && ' (select at least 2)'}
              {selectedCount > 3 && ' (max 3 recommended)'}
            </p>
            <button
              onClick={handleProceed}
              disabled={selectedCount < 2}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Logos
            </button>
          </div>
        </>
      )}
    </div>
  )
}
