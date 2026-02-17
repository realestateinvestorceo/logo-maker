import { MOCKUP_TYPES } from '../../lib/constants'

export default function MockupGallery({ mockups }) {
  if (!mockups) return null

  const availableMockups = MOCKUP_TYPES.filter((m) => mockups[m.key])

  if (availableMockups.length === 0) return null

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Context Mockups</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {availableMockups.map((type) => (
          <div key={type.key} className="flex-shrink-0 w-48">
            <div className="aspect-[4/3] bg-gray-50 rounded-lg border border-border overflow-hidden">
              <img
                src={mockups[type.key]}
                alt={type.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-500 mt-1 block text-center">{type.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
