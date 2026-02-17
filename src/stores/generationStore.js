import { create } from 'zustand'

export const useGenerationStore = create((set, get) => ({
  isGenerating: false,
  queue: [],
  completed: 0,
  total: 0,
  currentPrompt: null,
  errors: [],

  startBatch: (prompts) =>
    set({
      isGenerating: true,
      queue: prompts,
      completed: 0,
      total: prompts.length,
      currentPrompt: null,
      errors: [],
    }),

  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  markCompleted: () =>
    set((state) => ({ completed: state.completed + 1 })),

  addError: (error) =>
    set((state) => ({ errors: [...state.errors, error] })),

  finishBatch: () =>
    set({ isGenerating: false, queue: [], currentPrompt: null }),

  reset: () =>
    set({
      isGenerating: false,
      queue: [],
      completed: 0,
      total: 0,
      currentPrompt: null,
      errors: [],
    }),

  getProgress: () => {
    const { completed, total } = get()
    return total > 0 ? Math.round((completed / total) * 100) : 0
  },
}))
