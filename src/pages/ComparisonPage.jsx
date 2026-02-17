import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useLogoStore } from '../stores/logoStore'
import { useUiStore } from '../stores/uiStore'
import VersionTree from '../components/comparison/VersionTree'
import SideBySideCompare from '../components/comparison/SideBySideCompare'
import VersionTimeline from '../components/comparison/VersionTimeline'

export default function ComparisonPage() {
  const [activeTab, setActiveTab] = useState('tree')
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)
  const logos = useLogoStore((s) => s.logos)
  const comparisonIds = useUiStore((s) => s.comparisonIds)

  const handleProceed = async () => {
    await updateProject({ phase_progress: 7 })
    navigate('/share')
  }

  const tabs = [
    { id: 'tree', label: 'Version Tree' },
    { id: 'compare', label: `Compare (${comparisonIds.length})` },
    { id: 'timeline', label: 'Timeline' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare & History</h1>
          <p className="text-gray-500 mt-1">
            Trace logo lineage, compare side-by-side, and revisit past versions
          </p>
        </div>
        <button
          onClick={handleProceed}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Share for Review
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-tertiary rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-surface text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border min-h-[500px]">
        {activeTab === 'tree' && <VersionTree logos={logos} />}
        {activeTab === 'compare' && <SideBySideCompare />}
        {activeTab === 'timeline' && <VersionTimeline logos={logos} />}
      </div>
    </div>
  )
}
