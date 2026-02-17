import { useLogoStore } from '../../stores/logoStore'
import DirectionCard from './DirectionCard'

export default function DirectionSelector() {
  const directions = useLogoStore((s) => s.directions)
  const toggleDirectionSelection = useLogoStore((s) => s.toggleDirectionSelection)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {directions.map((direction) => (
        <DirectionCard
          key={direction.id}
          direction={direction}
          onToggle={toggleDirectionSelection}
        />
      ))}
    </div>
  )
}
