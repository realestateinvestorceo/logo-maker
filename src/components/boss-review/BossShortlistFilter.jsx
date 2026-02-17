export default function BossShortlistFilter({ filter, onChange }) {
  const options = [
    { id: 'all', label: 'All' },
    { id: 'starred', label: 'Shortlisted' },
    { id: 'approved', label: 'Approved' },
  ]

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filter === opt.id
              ? 'bg-surface text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
