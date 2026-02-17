import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useLogoStore } from '../stores/logoStore'
import { useUiStore } from '../stores/uiStore'
import FilterBar from '../components/review/FilterBar'
import LogoGrid from '../components/generation/LogoGrid'
import LogoDetailModal from '../components/review/LogoDetailModal'
import BranchDialog from '../components/review/BranchDialog'
import RefineDialog from '../components/review/RefineDialog'

export default function ReviewPage() {
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.project)
  const updateProject = useProjectStore((s) => s.updateProject)
  const getFilteredLogos = useLogoStore((s) => s.getFilteredLogos)
  const activeModal = useUiStore((s) => s.activeModal)
  const modalData = useUiStore((s) => s.modalData)
  const closeModal = useUiStore((s) => s.closeModal)
  const openModal = useUiStore((s) => s.openModal)

  const filteredLogos = getFilteredLogos()

  const handleProceed = async () => {
    await updateProject({ phase_progress: 5 })
    navigate('/grading')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review & Refine</h1>
          <p className="text-gray-500 mt-1">
            Browse your logos, branch variations, and refine with natural language
          </p>
        </div>
        <button
          onClick={handleProceed}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Grade & Test
        </button>
      </div>

      <FilterBar />

      <div className="mt-6">
        <LogoGrid
          logos={filteredLogos}
          onLogoClick={(logo) => openModal('logoDetail', logo)}
          showActions
        />
      </div>

      {activeModal === 'logoDetail' && modalData && (
        <LogoDetailModal logo={modalData} onClose={closeModal} />
      )}

      {activeModal === 'branch' && modalData && (
        <BranchDialog logo={modalData} onClose={closeModal} />
      )}

      {activeModal === 'refine' && modalData && (
        <RefineDialog logo={modalData} onClose={closeModal} />
      )}
    </div>
  )
}
