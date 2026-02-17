import { EXPORT_SIZES } from '../../lib/constants'

export default function BrandKitPreview({ kit }) {
  if (!kit) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand Kit Preview</h3>

      {/* Size Variants */}
      {kit.sizes && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Size Variants</h4>
          <div className="flex items-end gap-4 flex-wrap">
            {EXPORT_SIZES.filter((s) => s <= 128).map((size) => {
              const sizeData = kit.sizes.pngs?.find((p) => p.size === size)
              return (
                <div key={size} className="text-center">
                  <div
                    className="border border-border rounded bg-white mx-auto overflow-hidden"
                    style={{ width: Math.max(size, 16), height: Math.max(size, 16) }}
                  >
                    {sizeData?.path && (
                      <img src={sizeData.path} alt={`${size}px`} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">{size}px</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Light/Dark variants */}
      {(kit.sizes?.light_bg_path || kit.sizes?.dark_bg_path) && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Background Variants</h4>
          <div className="flex gap-4">
            {kit.sizes?.light_bg_path && (
              <div className="w-32 h-32 bg-white border border-border rounded-lg overflow-hidden">
                <img src={kit.sizes.light_bg_path} alt="Light background" className="w-full h-full object-contain p-3" />
              </div>
            )}
            {kit.sizes?.dark_bg_path && (
              <div className="w-32 h-32 bg-gray-900 border border-border rounded-lg overflow-hidden">
                <img src={kit.sizes.dark_bg_path} alt="Dark background" className="w-full h-full object-contain p-3" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Font */}
      {kit.fontIdentification && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Typography</h4>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            {kit.fontIdentification.primary && (
              <p>Primary: <strong>{kit.fontIdentification.primary}</strong></p>
            )}
            {kit.fontIdentification.secondary && (
              <p className="mt-1">Secondary: <strong>{kit.fontIdentification.secondary}</strong></p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
