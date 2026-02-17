export default function WinnerSelector({ logos, onSelect }) {
  if (logos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No graded logos available. Go back and grade your logos first.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Select the winning logo for your brand kit export:</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {logos.map((logo) => (
          <button
            key={logo.id}
            onClick={() => onSelect(logo)}
            className="group relative aspect-square bg-gray-50 rounded-lg border-2 border-border overflow-hidden hover:border-brand-400 transition-colors"
          >
            <img
              src={logo.storage_path}
              alt="Logo"
              className="w-full h-full object-contain p-2"
            />
            {logo.scores?.composite != null && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-xs font-bold rounded">
                {logo.scores.composite}
              </div>
            )}
            {logo.is_favorite && (
              <div className="absolute top-1 left-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors flex items-center justify-center">
              <span className="text-brand-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1 rounded-full">
                Select
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
