import { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function DownloadPackage({ kit, projectName }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder(`${projectName || 'brand'}-kit`)

      // Download and add each asset
      const fetchAndAdd = async (url, path) => {
        try {
          const response = await fetch(url)
          const blob = await response.blob()
          folder.file(path, blob)
        } catch (err) {
          console.warn(`Failed to fetch ${path}:`, err)
        }
      }

      const tasks = []

      // PNGs at various sizes
      if (kit.sizes?.pngs) {
        const pngFolder = folder.folder('png')
        kit.sizes.pngs.forEach((png) => {
          tasks.push(fetchAndAdd(png.path, `png/logo-${png.size}px.png`))
        })
      }

      // Background variants
      if (kit.sizes?.light_bg_path) {
        tasks.push(fetchAndAdd(kit.sizes.light_bg_path, 'logo-light-bg.png'))
      }
      if (kit.sizes?.dark_bg_path) {
        tasks.push(fetchAndAdd(kit.sizes.dark_bg_path, 'logo-dark-bg.png'))
      }

      // SVG
      if (kit.sizes?.svg_path) {
        tasks.push(fetchAndAdd(kit.sizes.svg_path, 'logo.svg'))
      }

      // Mockups
      if (kit.mockup_paths) {
        const mockupFolder = folder.folder('mockups')
        Object.entries(kit.mockup_paths).forEach(([name, path]) => {
          tasks.push(fetchAndAdd(path, `mockups/${name}.png`))
        })
      }

      // Brand summary PDF
      if (kit.brand_summary_pdf_path) {
        tasks.push(fetchAndAdd(kit.brand_summary_pdf_path, 'brand-summary.pdf'))
      }

      // Color palette info
      if (kit.colorPalette) {
        const paletteText = kit.colorPalette
          .map((c, i) => `${c.name || `Color ${i + 1}`}: ${c.hex}`)
          .join('\n')
        folder.file('color-palette.txt', paletteText)
      }

      await Promise.all(tasks)

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${projectName || 'brand'}-kit.zip`)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="pt-4 border-t border-border">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {downloading ? (
          <>
            <LoadingSpinner size="sm" />
            Packaging assets...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Brand Kit (.zip)
          </>
        )}
      </button>
    </div>
  )
}
