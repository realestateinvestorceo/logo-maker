export default function BossHeader({ project }) {
  const brief = project?.company_brief || {}

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
          <span className="text-xl font-bold text-brand-700">
            {(brief.company_name || 'L')[0]}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {brief.company_name || project?.name || 'Logo Review'}
          </h1>
          <p className="text-sm text-gray-500">Logo concepts for your review</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        {brief.industry && (
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase">Industry</span>
            <p className="text-sm text-gray-700 mt-0.5">{brief.industry}</p>
          </div>
        )}
        {brief.target_audience && (
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase">Audience</span>
            <p className="text-sm text-gray-700 mt-0.5">{brief.target_audience}</p>
          </div>
        )}
        {brief.tone && (
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase">Brand Tone</span>
            <p className="text-sm text-gray-700 mt-0.5">{brief.tone}</p>
          </div>
        )}
        {brief.values && brief.values.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase">Values</span>
            <p className="text-sm text-gray-700 mt-0.5">{brief.values.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
