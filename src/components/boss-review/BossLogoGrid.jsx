import BossFeedbackPanel from './BossFeedbackPanel'

export default function BossLogoGrid({ logos, feedback, onFeedback }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {logos.map((logo) => (
        <div key={logo.id} className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
          {/* Logo Image */}
          <div className="aspect-square bg-gray-50 p-6">
            <img
              src={logo.storage_path}
              alt="Logo concept"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Score */}
          {logo.scores && (
            <div className="px-4 py-2 border-t border-border-light bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">AI Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        logo.scores.composite >= 80 ? 'bg-green-500' :
                        logo.scores.composite >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${logo.scores.composite}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{logo.scores.composite}</span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Panel */}
          <BossFeedbackPanel
            logoId={logo.id}
            feedback={feedback[logo.id]}
            onFeedback={onFeedback}
          />

          {/* Mockup thumbnails */}
          {logo.mockups && (
            <div className="px-4 pb-3 flex gap-1">
              {Object.values(logo.mockups).slice(0, 4).map((path, i) => (
                <div key={i} className="w-10 h-10 rounded border border-border overflow-hidden">
                  <img src={path} alt="Mockup" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
