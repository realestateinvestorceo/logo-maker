import { create } from 'zustand'

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  toasts: [],
  comparisonIds: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  addToast: (toast) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, toast.duration || 4000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  addToComparison: (logoId) =>
    set((state) => {
      if (state.comparisonIds.includes(logoId)) return state
      if (state.comparisonIds.length >= 4) return state
      return { comparisonIds: [...state.comparisonIds, logoId] }
    }),

  removeFromComparison: (logoId) =>
    set((state) => ({
      comparisonIds: state.comparisonIds.filter((id) => id !== logoId),
    })),

  clearComparison: () => set({ comparisonIds: [] }),
}))
