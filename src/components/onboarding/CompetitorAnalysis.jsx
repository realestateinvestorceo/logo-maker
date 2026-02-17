import { useState, useRef } from 'react'
import { api } from '../../lib/api'
import { useProjectStore } from '../../stores/projectStore'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function CompetitorAnalysis({ projectId }) {
  const [logos, setLogos] = useState([]) // { file, preview, name }
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()
  const updateProject = useProjectStore((s) => s.updateProject)

  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (logos.length >= 5) return
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogos((prev) => [...prev, { file, preview: e.target.result, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeLogo = (index) => {
    setLogos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    if (logos.length < 2) return
    setLoading(true)
    try {
      const images = logos.map((l) => ({
        base64: l.preview.split(',')[1],
        mediaType: l.file.type,
        name: l.name,
      }))

      const result = await api.analyzeCompetitors({
        projectId,
        images,
      })
      setAnalysis(result)
      await updateProject({ competitor_analysis: result })
    } catch (err) {
      console.error('Competitor analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Competitor Logo Analysis</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload 3-5 competitor logos to map the visual landscape of your space.
      </p>

      {/* Upload area */}
      <div className="flex flex-wrap gap-3 mb-4">
        {logos.map((logo, i) => (
          <div key={i} className="relative w-24 h-24">
            <img
              src={logo.preview}
              alt={logo.name}
              className="w-full h-full object-contain rounded-lg bg-gray-50 border border-border"
            />
            <button
              onClick={() => removeLogo(i)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            >
              x
            </button>
          </div>
        ))}

        {logos.length < 5 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-gray-300 hover:border-brand-300 hover:text-brand-400 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!analysis && (
        <button
          onClick={handleAnalyze}
          disabled={logos.length < 2 || loading}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : null}
          {loading ? 'Analyzing...' : `Analyze ${logos.length} Competitors`}
        </button>
      )}

      {analysis && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'colors', label: 'Common Colors' },
              { key: 'icon_styles', label: 'Icon Styles' },
              { key: 'typography', label: 'Typography Trends' },
              { key: 'layout_patterns', label: 'Layout Patterns' },
            ].map((section) => (
              <div key={section.key} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h4>
                <div className="flex flex-wrap gap-1">
                  {(analysis[section.key] || []).map((item, i) => (
                    <span key={i} className="text-xs bg-white text-gray-600 px-2 py-1 rounded border border-border">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {analysis.opportunities && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Differentiation Opportunities</h4>
              <ul className="space-y-1">
                {analysis.opportunities.map((opp, i) => (
                  <li key={i} className="text-sm text-green-700">{opp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
