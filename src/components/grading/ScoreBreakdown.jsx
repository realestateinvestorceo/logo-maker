import { SCORE_DIMENSIONS } from '../../lib/constants'

export default function ScoreBreakdown({ scores, compact = false }) {
  if (!scores) return null

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Score</h3>
          <span className={`text-2xl font-bold ${
            scores.composite >= 80 ? 'text-green-600' :
            scores.composite >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {scores.composite}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {SCORE_DIMENSIONS.map((dim) => {
          const score = scores[dim.key]
          if (!score) return null

          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-gray-600">{dim.label}</span>
                <span className="text-xs font-bold text-gray-800">{score.score}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    score.score >= 80 ? 'bg-green-500' :
                    score.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
              {!compact && score.rationale && (
                <p className="text-xs text-gray-400 mt-0.5">{score.rationale}</p>
              )}
            </div>
          )
        })}
      </div>

      {!compact && scores.summary && (
        <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-border">{scores.summary}</p>
      )}
    </div>
  )
}
