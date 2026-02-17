import { useProjectStore } from '../../stores/projectStore'
import { PHASES } from '../../lib/constants'

export default function ProgressStepper() {
  const project = useProjectStore((s) => s.project)
  const currentPhase = project?.phase_progress || 1

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, i) => (
        <div key={phase.id} className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              phase.id < currentPhase
                ? 'bg-success'
                : phase.id === currentPhase
                ? 'bg-brand-500'
                : 'bg-gray-200'
            }`}
            title={phase.name}
          />
          {i < PHASES.length - 1 && (
            <div className={`w-4 h-0.5 ${phase.id < currentPhase ? 'bg-success' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
