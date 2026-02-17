import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function HomePage() {
  const [projectName, setProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const createProject = useProjectStore((s) => s.createProject)
  const loadProject = useProjectStore((s) => s.loadProject)

  const handleCreate = async () => {
    if (!projectName.trim()) return
    setIsCreating(true)
    try {
      await createProject(projectName.trim())
      navigate('/onboard')
    } catch {
      setIsCreating(false)
    }
  }

  const handleContinue = () => {
    const phase = project?.phase_progress || 1
    const phaseRoutes = {
      1: '/onboard',
      2: '/strategy',
      3: '/generate',
      4: '/review-logos',
      5: '/grading',
      6: '/compare',
      7: '/share',
      8: '/export',
    }
    navigate(phaseRoutes[phase] || '/onboard')
  }

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Logo Explorer</h1>
        <p className="text-gray-500 text-lg">From zero to a boss-approved logo through AI-powered exploration</p>
      </div>

      {project ? (
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Phase {project.phase_progress} of 8</p>
            </div>
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Continue Project
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          {project ? 'Start a New Project' : 'Get Started'}
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Enter your company or project name"
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <button
            onClick={handleCreate}
            disabled={!projectName.trim() || isCreating}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? <LoadingSpinner size="sm" /> : null}
            {project ? 'New Project' : 'Start'}
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-4 gap-4">
        {[
          { step: '1', label: 'Company Brief', desc: 'Upload PDF or answer questions' },
          { step: '2', label: 'AI Strategy', desc: 'Claude proposes directions' },
          { step: '3', label: 'Generate', desc: 'Imagen creates logos' },
          { step: '4', label: 'Review & Export', desc: 'Grade, compare, share' },
        ].map((item) => (
          <div key={item.step} className="text-center">
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
              {item.step}
            </div>
            <h4 className="text-sm font-medium text-gray-700">{item.label}</h4>
            <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
