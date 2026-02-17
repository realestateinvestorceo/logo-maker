import { useState, useRef } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function PdfUploader({ onExtracted }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const inputRef = useRef()

  const handleFile = async (selectedFile) => {
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      setStatus({ type: 'error', message: 'Please upload a PDF file' })
      return
    }

    setFile(selectedFile)
    setLoading(true)
    setStatus({ type: 'info', message: 'Extracting text from PDF...' })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const parseResult = await api.parsePdf(formData)
      setStatus({ type: 'info', message: 'Claude is analyzing your document...' })

      const extractResult = await api.extractCompany({ text: parseResult.text })
      setStatus({ type: 'success', message: 'Company data extracted successfully!' })
      onExtracted(extractResult)
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to process PDF' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-brand-400 bg-brand-50'
            : 'border-border hover:border-brand-300 hover:bg-brand-50/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading ? (
          <LoadingSpinner size="lg" className="mb-4" />
        ) : (
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          {file ? file.name : 'Upload your pitch deck or brand guide'}
        </h3>
        <p className="text-sm text-gray-400">
          {loading ? status?.message : 'Drag & drop a PDF here, or click to browse'}
        </p>
      </div>

      {status && !loading && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          status.type === 'error' ? 'bg-red-50 text-red-700' :
          status.type === 'success' ? 'bg-green-50 text-green-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  )
}
