import { useUiStore } from '../../stores/uiStore'
import ScoreBreakdown from '../grading/ScoreBreakdown'

export default function LogoDetailModal({ logo, onClose }) {
  const openModal = useUiStore((s) => s.openModal)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gray-50 p-8 flex items-center justify-center">
            <img
              src={logo.storage_path}
              alt="Logo detail"
              className="max-w-full max-h-80 object-contain"
            />
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Details</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-800 capitalize">{logo.generation_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Style</span>
                  <span className="text-gray-800">{logo.style_levers?.style || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Palette</span>
                  <span className="text-gray-800">{logo.style_levers?.palette || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-800">{new Date(logo.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {logo.prompt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Prompt</h3>
                <p className="mt-1 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{logo.prompt}</p>
              </div>
            )}

            {logo.scores && <ScoreBreakdown scores={logo.scores} compact />}

            {/* Actions */}
            <div className="pt-4 border-t border-border flex gap-2">
              <button
                onClick={() => { onClose(); openModal('branch', logo) }}
                className="flex-1 px-3 py-2 text-sm font-medium bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors"
              >
                More Like This
              </button>
              <button
                onClick={() => { onClose(); openModal('refine', logo) }}
                className="flex-1 px-3 py-2 text-sm font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Refine
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
