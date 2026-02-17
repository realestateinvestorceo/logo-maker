import LogoCard from './LogoCard'
import EmptyState from '../shared/EmptyState'

export default function LogoGrid({ logos, onLogoClick, showActions = false, showScores = false }) {
  if (!logos || logos.length === 0) {
    return (
      <EmptyState
        title="No logos yet"
        description="Generate logos to see them here"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5z" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          logo={logo}
          onClick={onLogoClick}
          showActions={showActions}
          showScores={showScores}
        />
      ))}
    </div>
  )
}
