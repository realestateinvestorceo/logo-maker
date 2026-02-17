import { useUiStore } from '../../stores/uiStore'
import { useLogoStore } from '../../stores/logoStore'
import ScoreBreakdown from '../grading/ScoreBreakdown'

export default function SideBySideCompare() {
  const comparisonIds = useUiStore((s) => s.comparisonIds)
  const removeFromComparison = useUiStore((s) => s.removeFromComparison)
  const clearComparison = useUiStore((s) => s.clearComparison)
  const logos = useLogoStore((s) => s.logos)

  const selectedLogos = comparisonIds
    .map((id) => logos.find((l) => l.id === id))
    .filter(Boolean)

  if (selectedLogos.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        <p className="text-sm">Select logos to compare from the Review page</p>
        <p className="text-xs mt-1">Click the compare icon on any logo card</p>
      </div>
    )
  }

  const gridCols = selectedLogos.length <= 2 ? 'grid-cols-2' : selectedLogos.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">
          Comparing {selectedLogos.length} logos
        </h3>
        <button
          onClick={clearComparison}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear all
        </button>
      </div>

      <div className={`grid ${gridCols} gap-6`}>
        {selectedLogos.map((logo) => (
          <div key={logo.id} className="space-y-3">
            <div className="relative">
              <img
                src={logo.storage_path}
                alt="Logo"
                className="w-full aspect-square object-contain rounded-lg bg-gray-50 border border-border"
              />
              <button
                onClick={() => removeFromComparison(logo.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                logo.generation_type === 'initial' ? 'bg-blue-100 text-blue-700' :
                logo.generation_type === 'branch' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {logo.generation_type}
              </span>
            </div>

            {logo.scores && <ScoreBreakdown scores={logo.scores} compact />}

            {logo.style_levers && (
              <div className="text-xs text-gray-400 space-y-0.5">
                {logo.style_levers.style && <div>Style: {logo.style_levers.style}</div>}
                {logo.style_levers.palette && <div>Palette: {logo.style_levers.palette}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
