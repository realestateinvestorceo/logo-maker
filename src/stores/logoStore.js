import { create } from 'zustand'

export const useLogoStore = create((set, get) => ({
  logos: [],
  directions: [],
  selectedLogoIds: [],
  filters: {
    directionId: null,
    style: null,
    scoreRange: null,
    generationType: null,
    favoritesOnly: false,
  },
  sortBy: 'created_at',
  sortOrder: 'desc',

  setLogos: (logos) => set({ logos }),

  addLogo: (logo) => set((state) => ({ logos: [...state.logos, logo] })),

  addLogos: (newLogos) => set((state) => ({ logos: [...state.logos, ...newLogos] })),

  updateLogo: (id, updates) =>
    set((state) => ({
      logos: state.logos.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      logos: state.logos.map((l) =>
        l.id === id ? { ...l, is_favorite: !l.is_favorite } : l
      ),
    })),

  setDirections: (directions) => set({ directions }),

  toggleDirectionSelection: (id) =>
    set((state) => ({
      directions: state.directions.map((d) =>
        d.id === id ? { ...d, selected: !d.selected } : d
      ),
    })),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  clearFilters: () =>
    set({
      filters: {
        directionId: null,
        style: null,
        scoreRange: null,
        generationType: null,
        favoritesOnly: false,
      },
    }),

  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  toggleLogoSelection: (id) =>
    set((state) => ({
      selectedLogoIds: state.selectedLogoIds.includes(id)
        ? state.selectedLogoIds.filter((lid) => lid !== id)
        : [...state.selectedLogoIds, id],
    })),

  clearSelection: () => set({ selectedLogoIds: [] }),

  // Computed: filtered and sorted logos
  getFilteredLogos: () => {
    const { logos, filters, sortBy, sortOrder } = get()

    let filtered = logos.filter((l) => !l.is_archived)

    if (filters.directionId) {
      filtered = filtered.filter((l) => l.direction_id === filters.directionId)
    }
    if (filters.style) {
      filtered = filtered.filter((l) => l.style_levers?.style === filters.style)
    }
    if (filters.generationType) {
      filtered = filtered.filter((l) => l.generation_type === filters.generationType)
    }
    if (filters.favoritesOnly) {
      filtered = filtered.filter((l) => l.is_favorite)
    }
    if (filters.scoreRange) {
      filtered = filtered.filter((l) => {
        const score = l.scores?.composite
        if (score == null) return false
        return score >= filters.scoreRange[0] && score <= filters.scoreRange[1]
      })
    }

    filtered.sort((a, b) => {
      let aVal, bVal
      if (sortBy === 'composite') {
        aVal = a.scores?.composite ?? -1
        bVal = b.scores?.composite ?? -1
      } else {
        aVal = new Date(a[sortBy] || 0)
        bVal = new Date(b[sortBy] || 0)
      }
      return sortOrder === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1)
    })

    return filtered
  },
}))
