import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import PdfUploader from '../components/onboarding/PdfUploader'
import CompanySummaryCard from '../components/onboarding/CompanySummaryCard'
import QuestionnaireFallback from '../components/onboarding/QuestionnaireFallback'
import ExistingLogoAnalysis from '../components/onboarding/ExistingLogoAnalysis'
import CompetitorAnalysis from '../components/onboarding/CompetitorAnalysis'

const TABS = [
  { id: 'pdf', label: 'Upload PDF' },
  { id: 'questionnaire', label: 'Questionnaire' },
  { id: 'existing', label: 'Existing Logo' },
  { id: 'competitors', label: 'Competitors' },
]

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState('pdf')
  const [companyData, setCompanyData] = useState(null)
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)

  const handleCompanyExtracted = (data) => {
    setCompanyData(data)
    if (data.gaps && data.gaps.length > 0) {
      setActiveTab('questionnaire')
    }
  }

  const handleBriefConfirmed = async (brief) => {
    await updateProject({ company_brief: brief, phase_progress: 2 })
    navigate('/strategy')
  }

  const handleProceed = async () => {
    if (companyData) {
      await handleBriefConfirmed(companyData)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Intelligence</h1>
        <p className="text-gray-500 mt-1">Help us understand your brand to create the perfect logo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-tertiary rounded-lg p-1 mb-6">
        {TABS.map((tab) => (
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

      {/* Tab Content */}
      <div className="bg-surface rounded-xl border border-border p-6">
        {activeTab === 'pdf' && (
          <div>
            <PdfUploader onExtracted={handleCompanyExtracted} />
            {companyData && (
              <div className="mt-6">
                <CompanySummaryCard
                  data={companyData}
                  onChange={setCompanyData}
                  onConfirm={handleBriefConfirmed}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'questionnaire' && (
          <QuestionnaireFallback
            existingData={companyData}
            onComplete={(data) => {
              setCompanyData(data)
              handleBriefConfirmed(data)
            }}
          />
        )}

        {activeTab === 'existing' && (
          <ExistingLogoAnalysis projectId={project?.id} />
        )}

        {activeTab === 'competitors' && (
          <CompetitorAnalysis projectId={project?.id} />
        )}
      </div>

      {/* Proceed Button */}
      {companyData && activeTab !== 'questionnaire' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleProceed}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Proceed to Strategy
          </button>
        </div>
      )}
    </div>
  )
}
