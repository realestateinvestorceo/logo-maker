import { useLogoStore } from '../../stores/logoStore'
import { useUiStore } from '../../stores/uiStore'

export default function LogoCard({ logo, onClick, showActions = false, showScores = false }) {
  const toggleFavorite = useLogoStore((s) => s.toggleFavorite)
  const openModal = useUiStore((s) => s.openModal)
  const addToComparison = useUiStore((s) => s.addToComparison)

  const score = logo.scores?.composite

  return (
    <div
      className="group relative bg-surface rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(logo)}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-50 p-3">
        <img
          src={logo.storage_path || logo.thumbnail_path}
          alt="Generated logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Score badge */}
      {showScores && score != null && (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          {score}
        </div>
      )}

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleFavorite(logo.id)
        }}
        className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          logo.is_favorite
            ? 'bg-red-500 text-white'
            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
      >
        <svg className="w-4 h-4" fill={logo.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      {/* Info bar */}
      <div className="px-3 py-2 border-t border-border-light">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 truncate">
            {logo.style_levers?.style || logo.generation_type}
          </span>
          {showActions && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openModal('branch', logo)
                }}
                className="p-1 text-gray-400 hover:text-brand-600"
                title="Branch variations"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openModal('refine', logo)
                }}
                className="p-1 text-gray-400 hover:text-brand-600"
                title="Refine"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addToComparison(logo.id)
                }}
                className="p-1 text-gray-400 hover:text-brand-600"
                title="Add to comparison"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
