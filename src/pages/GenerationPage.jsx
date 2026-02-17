import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useLogoStore } from '../stores/logoStore'
import { useGenerationStore } from '../stores/generationStore'
import { api } from '../lib/api'
import GenerationProgress from '../components/generation/GenerationProgress'
import LogoGrid from '../components/generation/LogoGrid'
import LoadingSpinner from '../components/shared/LoadingSpinner'

const MAX_CONCURRENT = 2

export default function GenerationPage() {
  const [engineeringPrompts, setEngineeringPrompts] = useState(false)
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)
  const directions = useLogoStore((s) => s.directions)
  const addLogo = useLogoStore((s) => s.addLogo)
  const logos = useLogoStore((s) => s.logos)

  const { isGenerating, completed, total, startBatch, setCurrentPrompt, markCompleted, addError, finishBatch } =
    useGenerationStore()

  const generateFromPrompts = useCallback(async (prompts) => {
    startBatch(prompts)
    const queue = [...prompts]

    const runNext = async () => {
      while (queue.length > 0) {
        const prompt = queue.shift()
        setCurrentPrompt(prompt.prompt_text)
        try {
          const logo = await api.generateLogo({
            projectId: project.id,
            directionId: prompt.direction_id,
            prompt: prompt.prompt_text,
            styleLevers: prompt.style_levers,
          })
          addLogo(logo)
          markCompleted()
        } catch (err) {
          addError({ prompt: prompt.prompt_text, error: err.message })
          markCompleted()
        }
      }
    }

    // Run with controlled concurrency
    const workers = Array.from({ length: MAX_CONCURRENT }, runNext)
    await Promise.all(workers)
    finishBatch()
  }, [project?.id, startBatch, setCurrentPrompt, markCompleted, addError, finishBatch, addLogo])

  const handleStartGeneration = async () => {
    const selectedDirs = directions.filter((d) => d.selected)
    if (selectedDirs.length === 0) return

    setEngineeringPrompts(true)
    try {
      const result = await api.engineerPrompts({
        projectId: project.id,
        directions: selectedDirs,
        companyBrief: project.company_brief,
      })
      setEngineeringPrompts(false)
      await generateFromPrompts(result.prompts)
    } catch (err) {
      setEngineeringPrompts(false)
      console.error('Generation failed:', err)
    }
  }

  useEffect(() => {
    if (logos.length === 0 && !isGenerating && !engineeringPrompts) {
      handleStartGeneration()
    }
  }, [])

  const handleProceed = async () => {
    await updateProject({ phase_progress: 4 })
    navigate('/review-logos')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Logo Generation</h1>
        <p className="text-gray-500 mt-1">
          {isGenerating
            ? 'Generating logos with Imagen 3...'
            : engineeringPrompts
            ? 'Claude is crafting generation prompts...'
            : `${logos.length} logos generated`}
        </p>
      </div>

      {engineeringPrompts ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Claude is engineering creative prompts for Imagen 3...</p>
        </div>
      ) : (
        <>
          {(isGenerating || total > 0) && <GenerationProgress />}

          {logos.length > 0 && (
            <div className="mt-6">
              <LogoGrid logos={logos} />
            </div>
          )}

          {!isGenerating && logos.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProceed}
                className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Review & Refine
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
