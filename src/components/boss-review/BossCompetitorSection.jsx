export default function BossCompetitorSection({ analysis }) {
  if (!analysis) return null

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">How These Stand Out</h3>

      {analysis.summary && (
        <p className="text-sm text-gray-600 mb-4">{analysis.summary}</p>
      )}

      {analysis.opportunities && analysis.opportunities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Differentiation Points</h4>
          <ul className="space-y-1">
            {analysis.opportunities.map((opp, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                {opp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
