export default function VersionTimeline({ logos }) {
  const sorted = [...logos]
    .filter((l) => !l.is_archived)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  if (sorted.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="text-sm">No generation history yet.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {sorted.map((logo, i) => (
            <div key={logo.id} className="flex items-start gap-4 relative">
              {/* Dot */}
              <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 relative z-10 ml-[18px] ${
                logo.generation_type === 'initial' ? 'bg-blue-500' :
                logo.generation_type === 'branch' ? 'bg-purple-500' :
                logo.generation_type === 'refine' ? 'bg-green-500' :
                'bg-gray-400'
              }`} />

              {/* Content */}
              <div className="flex items-center gap-3 flex-1 bg-surface rounded-lg border border-border p-3 hover:shadow-sm transition-shadow">
                <img
                  src={logo.thumbnail_path || logo.storage_path}
                  alt="Logo"
                  className="w-12 h-12 object-contain rounded bg-gray-50 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 capitalize">
                      {logo.generation_type}
                    </span>
                    {logo.scores?.composite != null && (
                      <span className="text-xs text-gray-400">Score: {logo.scores.composite}</span>
                    )}
                    {logo.is_favorite && (
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {logo.refinement_instruction || logo.style_levers?.style || 'Generated'}
                  </p>
                </div>
                <span className="text-xs text-gray-300 flex-shrink-0">
                  {new Date(logo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
