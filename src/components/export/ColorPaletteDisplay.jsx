export default function ColorPaletteDisplay({ colors }) {
  if (!colors || colors.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Color Palette</h3>
      <div className="flex gap-3 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="text-center">
            <div
              className="w-16 h-16 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-xs font-mono text-gray-600 mt-1.5">{color.hex}</p>
            {color.name && (
              <p className="text-xs text-gray-400">{color.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
