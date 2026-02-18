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
  createProject: (data) => request('/project?action=create', { body: data }),
  getProject: (id) => request(`/project?action=get&id=${id}`),
  updateProject: (id, data) => request('/project?action=update', { body: { id, ...data } }),

  // Onboarding
  parsePdf: (data) => request('/onboarding?action=parse-pdf', { body: data }),
  extractCompany: (data) => request('/onboarding?action=extract-company', { body: data }),
  analyzeLogo: (data) => request('/onboarding?action=analyze-logo', { body: data }),
  analyzeCompetitors: (data) => request('/onboarding?action=analyze-competitors', { body: data }),

  // Strategy
  proposeDirections: (data) => request('/strategy?action=propose-directions', { body: data }),

  // Generation
  engineerPrompts: (data) => request('/generation?action=engineer-prompts', { body: data }),
  generateLogo: (data) => request('/generation?action=generate-logo', { body: data }),

  // Refinement
  branchVariations: (data) => request('/refinement?action=branch-variations', { body: data }),
  refineLogo: (data) => request('/refinement?action=refine-logo', { body: data }),
  improveExisting: (data) => request('/refinement?action=improve-existing', { body: data }),

  // Grading
  gradeLogo: (data) => request('/grading?action=grade-logo', { body: data }),
  gradeBatch: (data) => request('/grading?action=grade-batch', { body: data }),
  stressTest: (data) => request('/grading?action=stress-test', { body: data }),
  accessibility: (data) => request('/grading?action=accessibility', { body: data }),
  generateMockups: (data) => request('/grading?action=generate-mockups', { body: data }),

  // Review
  getReview: (token) => request(`/review?action=get-review&token=${token}`),
  submitFeedback: (data) => request('/review?action=submit-feedback', { body: data }),
  createShareLink: (data) => request('/review?action=create-share-link', { body: data }),

  // Export
  generateSizes: (data) => request('/export?action=generate-sizes', { body: data }),
  generateBrandKit: (data) => request('/export?action=generate-brand-kit', { body: data }),
  generateBrandPdf: (data) => request('/export?action=generate-brand-pdf', { body: data }),
}
