import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { SCORE_DIMENSIONS } from '../../lib/constants'

export default function ScoreRadar({ scores }) {
  if (!scores) return null

  const data = SCORE_DIMENSIONS.map((dim) => ({
    dimension: dim.label,
    score: scores[dim.key]?.score || 0,
    fullMark: 100,
  }))

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Score Radar</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="#4c6ef5"
            fill="#4c6ef5"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
