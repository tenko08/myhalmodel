'use client'

import { useRef, createElement, useState, useEffect } from 'react'

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
  appendAnimation?: (animationName: string, options?: { repetitions?: number }) => void
}

export default function ModelViewer() {
  const modelViewerRef = useRef<ModelViewerElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [animation1Playing, setAnimation1Playing] = useState(false)
  const [animation2Playing, setAnimation2Playing] = useState(false)

  // Load model-viewer library on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded && !customElements.get('model-viewer')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js'
      script.onload = () => setIsLoaded(true)
      script.onerror = () => {
        console.error('Failed to load model-viewer script')
        setIsLoaded(true) // Still set loaded to prevent infinite loading
      }
      document.head.appendChild(script)
    } else if (customElements.get('model-viewer')) {
      setIsLoaded(true)
    }
  }, [isLoaded])


  // Set up event listeners when the model viewer ref is available
  useEffect(() => {
    if (modelViewerRef.current && isLoaded) {
      const modelViewer = modelViewerRef.current
      
      const loadHandler = () => {
        console.log('Model loaded successfully')
        setModelReady(true)
      }
      
      const errorHandler = (event: Event) => {
        console.error('Model failed to load:', event)
        setModelReady(false)
      }

      modelViewer.addEventListener('load', loadHandler)
      modelViewer.addEventListener('error', errorHandler)

      // Cleanup function
      return () => {
        modelViewer.removeEventListener('load', loadHandler)
        modelViewer.removeEventListener('error', errorHandler)
      }
    }
  }, [isLoaded])

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading 3D Model...</div>
      </div>
    )
  }

  const playAnimation = (animationName: string) => {
    if (modelViewerRef.current && modelViewerRef.current.appendAnimation) {
      modelViewerRef.current.appendAnimation(animationName, {repetitions: 1});
      setAnimation1Playing(true)
      console.log('Animation played')
    }
  }

  return (
    <>
      <div className="p-4">
        <div className="mb-2">Model Status: {modelReady ? 'Ready' : 'Loading...'}</div>
        <button 
          disabled={!modelReady}
          onClick={() => {
            console.log('Button clicked, modelViewerRef.current:', modelViewerRef.current);
            if (modelViewerRef.current && modelViewerRef.current.appendAnimation) {
                playAnimation('Test1')
                setAnimation1Playing(true)
                console.log('Animation played')
            } else {
              console.log('Model not ready');
            }
          }}
        >
          {modelReady ? 'Play Animation 1' : 'Loading...'}
        </button>
        <button 
          disabled={!modelReady}
          className="ml-4"
          onClick={() => {
            console.log('Button clicked, modelViewerRef.current:', modelViewerRef.current);
            if (modelViewerRef.current && modelViewerRef.current.appendAnimation) {
              if (!animation2Playing) {
                playAnimation('Test2')
                setAnimation2Playing(true)
                console.log('Animation played')
              } else {
                playAnimation('Test2')
              }
            } else {
              console.log('Model not ready');
            }
          }}
        >
          {modelReady ? 'Play Animation 2' : 'Loading...'}
        </button>
      </div>
      <div className="w-full h-screen">
        {createElement('model-viewer', {
          ref: modelViewerRef,
          src: '/models/testanim.glb',
          alt: 'Floor 1 Model',
          disablePan: true,
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
          }
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
    </>
  )
}