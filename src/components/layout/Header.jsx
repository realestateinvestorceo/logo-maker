import { useProjectStore } from '../../stores/projectStore'
import ProgressStepper from './ProgressStepper'

export default function Header() {
  const project = useProjectStore((s) => s.project)

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {project?.name || 'Logo Explorer'}
        </h2>
        {project?.company_brief?.industry && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            {project.company_brief.industry}
          </span>
        )}
      </div>
      {project && <ProgressStepper />}
    </header>
  )
}
