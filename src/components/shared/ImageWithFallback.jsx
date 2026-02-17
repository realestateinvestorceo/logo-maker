import { useState } from 'react'

export default function ImageWithFallback({ src, alt, className = '', fallback = null }) {
  const [status, setStatus] = useState('loading')

  return (
    <div className={`relative ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      {status === 'error' ? (
        fallback || (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  )
}
