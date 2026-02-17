const API_BASE = '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const { body, method = body ? 'POST' : 'GET', headers = {}, ...rest } = options

  const config = {
    method,
    headers: { ...headers },
    ...rest,
  }

  if (body && !(body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(body)
  } else if (body instanceof FormData) {
    config.body = body
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(
      data.error || `Request failed: ${response.statusText}`,
      response.status,
      data
    )
  }

  return response.json()
}

export const api = {
  // Project
  createProject: (data) => request('/project/create', { body: data }),
  getProject: (id) => request(`/project/get?id=${id}`),
  updateProject: (id, data) => request('/project/update', { body: { id, ...data } }),

  // Onboarding
  parsePdf: (formData) => request('/onboarding/parse-pdf', { body: formData }),
  extractCompany: (data) => request('/onboarding/extract-company', { body: data }),
  analyzeLogo: (data) => request('/onboarding/analyze-logo', { body: data }),
  analyzeCompetitors: (data) => request('/onboarding/analyze-competitors', { body: data }),

  // Strategy
  proposeDirections: (data) => request('/strategy/propose-directions', { body: data }),

  // Generation
  engineerPrompts: (data) => request('/generation/engineer-prompts', { body: data }),
  generateLogo: (data) => request('/generation/generate-logo', { body: data }),

  // Refinement
  branchVariations: (data) => request('/refinement/branch-variations', { body: data }),
  refineLogo: (data) => request('/refinement/refine-logo', { body: data }),
  improveExisting: (data) => request('/refinement/improve-existing', { body: data }),

  // Grading
  gradeLogo: (data) => request('/grading/grade-logo', { body: data }),
  gradeBatch: (data) => request('/grading/grade-batch', { body: data }),
  stressTest: (data) => request('/grading/stress-test', { body: data }),
  accessibility: (data) => request('/grading/accessibility', { body: data }),
  generateMockups: (data) => request('/grading/generate-mockups', { body: data }),

  // Review
  getReview: (token) => request(`/review/get-review?token=${token}`),
  submitFeedback: (data) => request('/review/submit-feedback', { body: data }),
  createShareLink: (data) => request('/review/create-share-link', { body: data }),

  // Export
  generateSizes: (data) => request('/export/generate-sizes', { body: data }),
  generateBrandKit: (data) => request('/export/generate-brand-kit', { body: data }),
  generateBrandPdf: (data) => request('/export/generate-brand-pdf', { body: data }),
}
