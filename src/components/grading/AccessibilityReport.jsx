export default function AccessibilityReport({ data }) {
  if (!data) return null

  const { wcag_contrast, colorblind, backgrounds } = data

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Accessibility</h3>

      {/* WCAG Contrast */}
      {wcag_contrast && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">WCAG Contrast</h4>
          <div className="flex gap-2">
            <Badge pass={wcag_contrast.passes_aa} label="AA" />
            <Badge pass={wcag_contrast.passes_aaa} label="AAA" />
            <span className="text-xs text-gray-400 ml-2">
              Ratio: {wcag_contrast.ratio}:1
            </span>
          </div>
        </div>
      )}

      {/* Colorblind Simulations */}
      {colorblind && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Colorblind Simulations</h4>
          <div className="flex gap-3">
            {Object.entries(colorblind).map(([type, path]) => (
              <div key={type} className="text-center">
                <div className="w-16 h-16 border border-border rounded bg-gray-50 overflow-hidden">
                  <img src={path} alt={type} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs text-gray-500 mt-1 capitalize">{type.replace('opia', '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background Tests */}
      {backgrounds && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Background Tests</h4>
          <div className="flex gap-3">
            {Object.entries(backgrounds).map(([bg, path]) => (
              <div key={bg} className="text-center">
                <div className={`w-16 h-16 border border-border rounded overflow-hidden ${
                  bg === 'black' ? 'bg-black' : bg === 'white' ? 'bg-white' : 'bg-blue-600'
                }`}>
                  <img src={path} alt={bg} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs text-gray-500 mt-1 capitalize">{bg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ pass, label }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
      pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {label}: {pass ? 'Pass' : 'Fail'}
    </span>
  )
}
