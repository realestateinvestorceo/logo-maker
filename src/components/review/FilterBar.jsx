import { useLogoStore } from '../../stores/logoStore'
import { STYLE_OPTIONS } from '../../lib/constants'

export default function FilterBar() {
  const directions = useLogoStore((s) => s.directions)
  const filters = useLogoStore((s) => s.filters)
  const setFilter = useLogoStore((s) => s.setFilter)
  const clearFilters = useLogoStore((s) => s.clearFilters)
  const sortBy = useLogoStore((s) => s.sortBy)
  const setSortBy = useLogoStore((s) => s.setSortBy)

  const hasFilters = Object.values(filters).some((v) => v != null && v !== false)

  return (
    <div className="flex flex-wrap items-center gap-3 bg-surface rounded-xl border border-border px-4 py-3">
      {/* Direction filter */}
      <select
        value={filters.directionId || ''}
        onChange={(e) => setFilter('directionId', e.target.value || null)}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">All Directions</option>
        {directions.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      {/* Style filter */}
      <select
        value={filters.style || ''}
        onChange={(e) => setFilter('style', e.target.value || null)}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">All Styles</option>
        {STYLE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Type filter */}
      <select
        value={filters.generationType || ''}
        onChange={(e) => setFilter('generationType', e.target.value || null)}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">All Types</option>
        <option value="initial">Initial</option>
        <option value="branch">Branch</option>
        <option value="refine">Refined</option>
        <option value="improve">Improved</option>
      </select>

      {/* Favorites toggle */}
      <button
        onClick={() => setFilter('favoritesOnly', !filters.favoritesOnly)}
        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
          filters.favoritesOnly
            ? 'border-red-300 bg-red-50 text-red-600'
            : 'border-border text-gray-500 hover:bg-gray-50'
        }`}
      >
        Favorites
      </button>

      <div className="flex-1" />

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="created_at">Newest First</option>
        <option value="composite">Highest Score</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
