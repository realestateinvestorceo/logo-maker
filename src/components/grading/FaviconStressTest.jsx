export default function FaviconStressTest({ data }) {
  if (!data?.sizes) return null

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Favicon Stress Test</h3>
      <div className="flex items-end gap-6">
        {data.sizes.map((size) => (
          <div key={size.px} className="text-center">
            <div
              className="border border-border rounded bg-white mx-auto mb-2 overflow-hidden"
              style={{ width: size.px, height: size.px }}
            >
              {size.image_path && (
                <img
                  src={size.image_path}
                  alt={`${size.px}px`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <span className="text-xs text-gray-500">{size.px}px</span>
            <div className={`text-xs font-medium mt-1 ${size.readable ? 'text-green-600' : 'text-red-600'}`}>
              {size.readable ? 'Pass' : 'Fail'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
