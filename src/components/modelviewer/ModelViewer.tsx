import '@google/model-viewer'
import { useEffect, useRef } from 'react'

export default function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const modelViewer = document.createElement('model-viewer') as any
      
      modelViewer.src = '/models/Floor1.glb'
      modelViewer.alt = 'Floor 1 Model'
      modelViewer.autoRotate = true
      modelViewer.cameraControls = true
      modelViewer.ar = true
      modelViewer.arModes = 'webxr scene-viewer'
      modelViewer.shadowIntensity = '1'
      modelViewer.shadowSoftness = '0.5'
      modelViewer.environmentImage = 'neutral'
      modelViewer.exposure = '1'

      modelViewer.style.width = '100%'
      modelViewer.style.height = '100%'
      modelViewer.style.backgroundColor = '#f0f0f0'

      const poster = document.createElement('div')
      poster.setAttribute('slot', 'poster')
      poster.className = 'poster'
      
      const loadingDiv = document.createElement('div')
      loadingDiv.style.display = 'flex'
      loadingDiv.style.alignItems = 'center'
      loadingDiv.style.justifyContent = 'center'
      loadingDiv.style.height = '100%'
      loadingDiv.style.fontSize = '18px'
      loadingDiv.style.color = '#666'
      loadingDiv.textContent = 'Loading 3D Model...'
      
      poster.appendChild(loadingDiv)
      modelViewer.appendChild(poster)

      modelViewer.addEventListener('load', () => {
        console.log('Model loaded successfully')
      })

      modelViewer.addEventListener('error', (event: any) => {
        console.error('Model failed to load:', event)
      })

      containerRef.current.appendChild(modelViewer)

      return () => {
        if (containerRef.current && modelViewer.parentNode) {
          modelViewer.parentNode.removeChild(modelViewer)
        }
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen"
    />
  );
}