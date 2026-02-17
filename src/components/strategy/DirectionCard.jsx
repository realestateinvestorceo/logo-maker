import { DIRECTION_TYPES } from '../../lib/constants'

export default function DirectionCard({ direction, onToggle }) {
  const typeInfo = DIRECTION_TYPES.find((t) => t.id === direction.type)

  return (
    <div
      onClick={() => onToggle(direction.id)}
      className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${
        direction.selected
          ? 'border-brand-500 bg-brand-50 shadow-sm'
          : 'border-border hover:border-brand-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          direction.selected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {typeInfo?.label || direction.type}
        </span>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          direction.selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
        }`}>
          {direction.selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2">{direction.name}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{direction.rationale}</p>

      {direction.style_keywords && direction.style_keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {direction.style_keywords.map((kw, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {kw}
            </span>
          ))}
        </div>
      )}

      {direction.color_palette && (
        <div className="flex gap-1 mt-3">
          {(direction.color_palette.colors || []).slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}
