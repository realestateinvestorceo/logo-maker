import { useGenerationStore } from '../../stores/generationStore'

export default function GenerationProgress() {
  const { completed, total, currentPrompt, errors, isGenerating } = useGenerationStore()
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {isGenerating ? `Generating logo ${completed + 1} of ${total}` : `${completed} of ${total} complete`}
        </span>
        <span className="text-sm font-bold text-brand-600">{progress}%</span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentPrompt && isGenerating && (
        <p className="text-xs text-gray-400 mt-2 truncate">
          Current: {currentPrompt}
        </p>
      )}

      {errors.length > 0 && (
        <p className="text-xs text-danger mt-2">
          {errors.length} generation{errors.length > 1 ? 's' : ''} failed
        </p>
      )}
    </div>
  )
}
