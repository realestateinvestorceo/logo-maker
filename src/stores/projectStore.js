import { create } from 'zustand'
import { api } from '../lib/api'

export const useProjectStore = create((set, get) => ({
  project: null,
  loading: false,
  error: null,

  createProject: async (name) => {
    set({ loading: true, error: null })
    try {
      const project = await api.createProject({ name })
      set({ project, loading: false })
      return project
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  loadProject: async (id) => {
    set({ loading: true, error: null })
    try {
      const project = await api.getProject(id)
      set({ project, loading: false })
      return project
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  updateProject: async (updates) => {
    const { project } = get()
    if (!project) return

    try {
      const updated = await api.updateProject(project.id, updates)
      set({ project: { ...project, ...updated } })
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  setCompanyBrief: (brief) => {
    const { project } = get()
    if (project) {
      set({ project: { ...project, company_brief: brief } })
    }
  },

  setPhase: (phase) => {
    const { project } = get()
    if (project) {
      set({ project: { ...project, phase_progress: phase } })
    }
  },

  clearProject: () => set({ project: null, error: null }),
}))
