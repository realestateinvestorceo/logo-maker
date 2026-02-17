import { useState } from 'react'

const DEFAULT_QUESTIONS = [
  { key: 'company_name', question: 'What is your company name?', type: 'text' },
  { key: 'industry', question: 'What industry are you in?', type: 'text' },
  { key: 'target_audience', question: 'Who is your target audience?', type: 'textarea' },
  { key: 'mission_statement', question: 'What is your mission or core purpose?', type: 'textarea' },
  { key: 'tone', question: 'Describe your brand personality (e.g., professional, playful, bold, minimal)', type: 'text' },
  { key: 'values', question: 'What are your core brand values? (comma-separated)', type: 'text', isArray: true },
  { key: 'color_preferences', question: 'Any color preferences? (comma-separated, or "none")', type: 'text', isArray: true },
  { key: 'differentiators', question: 'What makes you different from competitors? (comma-separated)', type: 'text', isArray: true },
]

export default function QuestionnaireFallback({ existingData, onComplete }) {
  const [answers, setAnswers] = useState(existingData || {})
  const [currentQ, setCurrentQ] = useState(0)

  // Filter out questions that already have data
  const questions = DEFAULT_QUESTIONS.filter((q) => {
    const val = answers[q.key]
    if (q.isArray) return !val || val.length === 0
    return !val
  })

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">All set!</h3>
        <p className="text-sm text-gray-500 mb-4">We have all the info we need.</p>
        <button
          onClick={() => onComplete(answers)}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Proceed to Strategy
        </button>
      </div>
    )
  }

  const q = questions[Math.min(currentQ, questions.length - 1)]
  const progress = ((DEFAULT_QUESTIONS.length - questions.length + currentQ) / DEFAULT_QUESTIONS.length) * 100

  const handleAnswer = (value) => {
    const processed = q.isArray
      ? value.split(',').map((s) => s.trim()).filter(Boolean)
      : value

    setAnswers((prev) => ({ ...prev, [q.key]: processed }))

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    }
  }

  const handleSubmit = () => {
    onComplete({ ...existingData, ...answers })
  }

  const isLastQuestion = currentQ >= questions.length - 1

  return (
    <div>
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto">
        <p className="text-xs text-gray-400 mb-2">
          Question {currentQ + 1} of {questions.length}
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{q.question}</h3>

        {q.type === 'textarea' ? (
          <textarea
            value={q.isArray ? (answers[q.key] || []).join(', ') : answers[q.key] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Type your answer..."
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={q.isArray ? (answers[q.key] || []).join(', ') : answers[q.key] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isLastQuestion) handleSubmit()
                else setCurrentQ(currentQ + 1)
              }
            }}
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Type your answer..."
            autoFocus
          />
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            Back
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Complete
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="px-4 py-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
