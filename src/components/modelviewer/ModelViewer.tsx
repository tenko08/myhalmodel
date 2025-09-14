'use client'

import { useCallback, useRef, createElement, useState } from 'react'

interface ModelViewerElement extends HTMLElement {
  src?: string
  alt?: string
  autoRotate?: boolean
  cameraControls?: boolean
  ar?: boolean
  arModes?: string
  shadowIntensity?: string
  shadowSoftness?: string
  environmentImage?: string
  exposure?: string
}

export default function ModelViewer() {
  const modelViewerRef = useRef<ModelViewerElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load model-viewer library on component mount
  if (typeof window !== 'undefined' && !isLoaded) {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)
  }

  const handleLoad = useCallback(() => {
    console.log('Model loaded successfully')
  }, [])

  const handleError = useCallback((event: Event) => {
    console.error('Model failed to load:', event)
  }, [])

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading 3D Model...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      {createElement('model-viewer', {
        ref: modelViewerRef,
        src: '/models/Floor1.glb',
        alt: 'Floor 1 Model',
        autoRotate: true,
        cameraControls: true,
        ar: false,
        arModes: 'webxr scene-viewer',
        shadowIntensity: '1',
        shadowSoftness: '0.5',
        environmentImage: 'neutral',
        exposure: '1',
        style: {
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f0f0'
        },
        onLoad: handleLoad,
        onError: handleError
      }, 
        createElement('div', { slot: 'poster', className: 'poster' },
          createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '18px',
              color: '#666'
            }
          }, 'Loading 3D Model...')
        )
      )}
    </div>
  )
}