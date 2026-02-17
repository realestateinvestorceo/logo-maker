import { useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { useLogoStore } from '../stores/logoStore'
import { useUiStore } from '../stores/uiStore'
import { api } from '../lib/api'
import WinnerSelector from '../components/export/WinnerSelector'
import BrandKitPreview from '../components/export/BrandKitPreview'
import ColorPaletteDisplay from '../components/export/ColorPaletteDisplay'
import DownloadPackage from '../components/export/DownloadPackage'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function ExportPage() {
  const [selectedWinner, setSelectedWinner] = useState(null)
  const [brandKit, setBrandKit] = useState(null)
  const [generating, setGenerating] = useState(false)
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)
  const logos = useLogoStore((s) => s.logos)
  const addToast = useUiStore((s) => s.addToast)

  // Also handle the "Share for Review" phase
  const [shareLink, setShareLink] = useState(project?.share_token ? `${window.location.origin}/review/${project.share_token}` : null)
  const [creatingLink, setCreatingLink] = useState(false)

  const handleCreateShareLink = async () => {
    setCreatingLink(true)
    try {
      const result = await api.createShareLink({ projectId: project.id })
      const link = `${window.location.origin}/review/${result.token}`
      setShareLink(link)
      await navigator.clipboard.writeText(link)
      addToast({ type: 'success', message: 'Share link copied to clipboard!' })
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create share link' })
    } finally {
      setCreatingLink(false)
    }
  }

  const handleGenerateKit = async () => {
    if (!selectedWinner) return
    setGenerating(true)
    try {
      await updateProject({ winner_logo_id: selectedWinner.id, phase_progress: 8 })

      const [sizes, kit] = await Promise.all([
        api.generateSizes({ projectId: project.id, logoId: selectedWinner.id }),
        api.generateBrandKit({ projectId: project.id, logoId: selectedWinner.id }),
      ])

      setBrandKit({ ...kit, sizes })
      addToast({ type: 'success', message: 'Brand kit generated!' })
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to generate brand kit' })
    } finally {
      setGenerating(false)
    }
  }

  const scoredLogos = logos
    .filter((l) => l.scores && !l.is_archived)
    .sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Share & Export</h1>
        <p className="text-gray-500 mt-1">Share for boss review and export your final brand kit</p>
      </div>

      {/* Share Section */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Boss Review Link</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generate a shareable link for your boss to review and provide feedback on the logos.
        </p>
        {shareLink ? (
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm bg-gray-50"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink)
                addToast({ type: 'success', message: 'Link copied!' })
              }}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Copy
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreateShareLink}
            disabled={creatingLink}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {creatingLink ? <LoadingSpinner size="sm" /> : null}
            Generate Share Link
          </button>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Export Brand Kit</h2>

        {!selectedWinner ? (
          <WinnerSelector logos={scoredLogos} onSelect={setSelectedWinner} />
        ) : !brandKit ? (
          <div className="text-center py-8">
            <img
              src={selectedWinner.storage_path}
              alt="Winner"
              className="w-32 h-32 object-contain mx-auto rounded-lg bg-gray-50 mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              Selected: {selectedWinner.scores?.composite}/100 composite score
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSelectedWinner(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Change Selection
              </button>
              <button
                onClick={handleGenerateKit}
                disabled={generating}
                className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? <LoadingSpinner size="sm" /> : null}
                Generate Brand Kit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <BrandKitPreview kit={brandKit} />
            {brandKit.colorPalette && <ColorPaletteDisplay colors={brandKit.colorPalette} />}
            <DownloadPackage kit={brandKit} projectName={project?.name} />
          </div>
        )}
      </div>
    </div>
  )
}
