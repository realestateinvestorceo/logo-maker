import { useState, useRef } from 'react'
import { api } from '../../lib/api'
import { useProjectStore } from '../../stores/projectStore'
import { SCORE_DIMENSIONS } from '../../lib/constants'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function ExistingLogoAnalysis({ projectId }) {
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()
  const updateProject = useProjectStore((s) => s.updateProject)

  const handleFile = async (file) => {
    if (!file) return
    setLogoFile(file)

    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!logoPreview) return
    setLoading(true)
    try {
      const base64 = logoPreview.split(',')[1]
      const result = await api.analyzeLogo({
        projectId,
        imageBase64: base64,
        mediaType: logoFile.type,
      })
      setAnalysis(result)
      await updateProject({ existing_logo_analysis: result })
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Existing Logo Analysis</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload your current logo for a detailed analysis. This helps us understand what to improve.
      </p>

      {!logoPreview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-brand-300 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <p className="text-sm text-gray-400">Click to upload your current logo</p>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="w-48 flex-shrink-0">
            <img
              src={logoPreview}
              alt="Current logo"
              className="w-full aspect-square object-contain rounded-lg bg-gray-50 border border-border"
            />
            {!analysis && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : null}
                {loading ? 'Analyzing...' : 'Analyze Logo'}
              </button>
            )}
          </div>

          {analysis && (
            <div className="flex-1 space-y-3">
              {SCORE_DIMENSIONS.map((dim) => {
                const score = analysis[dim.key]
                if (!score) return null
                return (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{dim.label}</span>
                      <span className="text-sm font-bold text-gray-900">{score.score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score.score >= 70 ? 'bg-green-500' : score.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{score.rationale}</p>
                  </div>
                )
              })}

              {analysis.actionable_weaknesses && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Actionable Weaknesses</h4>
                  <ul className="space-y-1">
                    {analysis.actionable_weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-danger mt-0.5">-</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
