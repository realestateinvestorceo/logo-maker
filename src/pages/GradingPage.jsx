import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useLogoStore } from '../stores/logoStore'
import { api } from '../lib/api'
import { useUiStore } from '../stores/uiStore'
import LogoGrid from '../components/generation/LogoGrid'
import ScoreBreakdown from '../components/grading/ScoreBreakdown'
import FaviconStressTest from '../components/grading/FaviconStressTest'
import AccessibilityReport from '../components/grading/AccessibilityReport'
import MockupGallery from '../components/grading/MockupGallery'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function GradingPage() {
  const [grading, setGrading] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState(null)
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)
  const logos = useLogoStore((s) => s.logos)
  const updateLogo = useLogoStore((s) => s.updateLogo)
  const addToast = useUiStore((s) => s.addToast)

  const ungradedCount = logos.filter((l) => !l.scores && !l.is_archived).length
  const gradedLogos = logos.filter((l) => l.scores).sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0))

  const handleGradeAll = async () => {
    setGrading(true)
    try {
      const result = await api.gradeBatch({
        projectId: project.id,
      })
      result.grades.forEach((grade) => {
        updateLogo(grade.logoId, { scores: grade.scores })
      })
      addToast({ type: 'success', message: `Graded ${result.grades.length} logos` })
    } catch (err) {
      addToast({ type: 'error', message: 'Grading failed: ' + err.message })
    } finally {
      setGrading(false)
    }
  }

  const handleProceed = async () => {
    await updateProject({ phase_progress: 6 })
    navigate('/compare')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grading & Testing</h1>
          <p className="text-gray-500 mt-1">
            Score logos across 5 dimensions, test at small sizes, and check accessibility
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGradeAll}
            disabled={grading || ungradedCount === 0}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {grading ? <LoadingSpinner size="sm" /> : null}
            {grading ? 'Grading...' : `Grade All (${ungradedCount} ungraded)`}
          </button>
          <button
            onClick={handleProceed}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Compare
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo Grid */}
        <div className="lg:col-span-2">
          <LogoGrid
            logos={gradedLogos.length > 0 ? gradedLogos : logos}
            onLogoClick={setSelectedLogo}
            showScores
          />
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedLogo ? (
            <>
              <div className="bg-surface rounded-xl border border-border p-4">
                <img
                  src={selectedLogo.storage_path}
                  alt="Selected logo"
                  className="w-full aspect-square object-contain rounded-lg bg-gray-50 mb-4"
                />
                {selectedLogo.scores && <ScoreBreakdown scores={selectedLogo.scores} />}
              </div>

              {selectedLogo.favicon_test && (
                <FaviconStressTest data={selectedLogo.favicon_test} />
              )}

              {selectedLogo.accessibility && (
                <AccessibilityReport data={selectedLogo.accessibility} />
              )}

              {selectedLogo.mockups && (
                <MockupGallery mockups={selectedLogo.mockups} />
              )}
            </>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-8 text-center text-gray-400">
              <p className="text-sm">Select a logo to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
