import { useState } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useLogoStore } from '../../stores/logoStore'
import { api } from '../../lib/api'
import { useUiStore } from '../../stores/uiStore'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function BranchDialog({ logo, onClose }) {
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const project = useProjectStore((s) => s.project)
  const addLogos = useLogoStore((s) => s.addLogos)
  const addToast = useUiStore((s) => s.addToast)

  const handleBranch = async () => {
    setLoading(true)
    try {
      const result = await api.branchVariations({
        projectId: project.id,
        logoId: logo.id,
        instruction: instruction || undefined,
      })
      addLogos(result.logos)
      addToast({ type: 'success', message: `${result.logos.length} variations generated` })
      onClose()
    } catch (err) {
      addToast({ type: 'error', message: 'Branch failed: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">More Like This</h2>

        <div className="flex gap-4 mb-4">
          <img
            src={logo.storage_path}
            alt="Source logo"
            className="w-24 h-24 object-contain rounded-lg bg-gray-50 border border-border"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">
              Claude will generate 4-6 targeted variations of this logo with different palettes, typography, and styling.
            </p>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Optional: specify what to vary (e.g., 'try warmer colors', 'make more minimal')..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBranch}
            disabled={loading}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : null}
            {loading ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
      </div>
    </div>
  )
}
