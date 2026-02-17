import { useState } from 'react'

const FIELDS = [
  { key: 'company_name', label: 'Company Name' },
  { key: 'industry', label: 'Industry' },
  { key: 'target_audience', label: 'Target Audience' },
  { key: 'mission_statement', label: 'Mission Statement', multiline: true },
  { key: 'tone', label: 'Brand Personality / Tone' },
  { key: 'values', label: 'Core Values', isArray: true },
  { key: 'color_preferences', label: 'Color Preferences', isArray: true },
  { key: 'differentiators', label: 'Key Differentiators', isArray: true },
]

export default function CompanySummaryCard({ data, onChange, onConfirm }) {
  const [editing, setEditing] = useState(null)

  const handleFieldChange = (key, value) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Here's what I learned - is this right?
        </h3>
        <button
          onClick={() => onConfirm(data)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Looks Good - Proceed
        </button>
      </div>

      {data.gaps && data.gaps.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          Missing info: {data.gaps.join(', ')}. Switch to the Questionnaire tab to fill these in.
        </div>
      )}

      <div className="space-y-3">
        {FIELDS.map((field) => {
          const value = data[field.key]
          const isEditing = editing === field.key

          return (
            <div key={field.key} className="flex items-start gap-4 group">
              <label className="w-40 text-sm font-medium text-gray-500 pt-2 flex-shrink-0">
                {field.label}
              </label>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    {field.multiline ? (
                      <textarea
                        value={field.isArray ? (value || []).join(', ') : value || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            field.key,
                            field.isArray ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean) : e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={field.isArray ? (value || []).join(', ') : value || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            field.key,
                            field.isArray ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean) : e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    )}
                    <button
                      onClick={() => setEditing(null)}
                      className="px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-lg"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditing(field.key)}
                    className="px-3 py-2 rounded-lg text-sm text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {field.isArray
                      ? (value || []).length > 0
                        ? value.map((v, i) => (
                            <span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-1 mb-1 text-xs">
                              {v}
                            </span>
                          ))
                        : <span className="text-gray-300 italic">Click to add</span>
                      : value || <span className="text-gray-300 italic">Click to add</span>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
