import { Mesh, Material } from 'three';
import { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

type LocationPingProps = {
  radius?: number;
  opacity?: number;
  color?: string;
  animationSpeed?: number;
  pulseRange?: number;
  pulseDuration?: number;
} & ThreeElements['mesh'];

interface LocationPingMethods {
  startPulsing: () => void;
  stopPulsing: () => void;
}

type LocationPingRef = Mesh & LocationPingMethods;

const LocationPing = forwardRef<LocationPingRef, LocationPingProps>(({
  position = [0, 0, 0],
  radius = 20,
  opacity = 0,
  color = '#ff0000',
  animationSpeed = 0.1,
  pulseRange = 0.8,
  pulseDuration = 1000,
  ...meshProps
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<Material | null>(null);
  const isAnimatingRef = useRef(false);
  const animationStartTimeRef = useRef(0);
  const currentScaleRef = useRef(1);
  const currentOpacityRef = useRef(opacity);

  // Simple animation using useFrame
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    if (isAnimatingRef.current) {
      const elapsed = state.clock.elapsedTime * 1000; // Convert to milliseconds
      const cycleTime = pulseDuration;
      const cycleProgress = (elapsed % cycleTime) / cycleTime;
      
      // Create a smooth pulse effect
      const scale = 1 + pulseRange * Math.sin(cycleProgress * Math.PI * 2);
      const opacity = 0.3 + 0.4 * Math.sin(cycleProgress * Math.PI * 2);
      
      meshRef.current.scale.set(scale * radius, scale * radius, scale * radius);
      (materialRef.current as any).opacity = opacity;
      currentScaleRef.current = scale;
      currentOpacityRef.current = opacity;
    } else {
      // Smooth transition to target opacity when not animating
      const diff = opacity - currentOpacityRef.current;
      if (Math.abs(diff) > 0.001) {
        const newOpacity = currentOpacityRef.current + diff * animationSpeed;
        currentOpacityRef.current = newOpacity;
        (materialRef.current as any).opacity = newOpacity;
      }
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;

    console.log('LocationPing mounted at position:', position, 'with radius:', radius);

    // Ensure material reference is set
    if (meshRef.current.material) {
      if (Array.isArray(meshRef.current.material)) {
        materialRef.current = meshRef.current.material[0];
      } else {
        materialRef.current = meshRef.current.material;
      }
    }

    if (ref) {
      const mesh = meshRef.current as LocationPingRef;
      mesh.startPulsing = () => {
        console.log('Starting pulse animation');
        isAnimatingRef.current = true;
        animationStartTimeRef.current = Date.now();
      };
      mesh.stopPulsing = () => {
        console.log('Stopping pulse animation');
        isAnimatingRef.current = false;
        if (meshRef.current) {
          meshRef.current.scale.set(radius, radius, radius);
        }
        if (materialRef.current) {
          (materialRef.current as any).opacity = 0;
        }
        currentOpacityRef.current = 0;
        currentScaleRef.current = 1;
      };
      
      if (typeof ref === 'function') {
        ref(mesh);
      } else {
        ref.current = mesh;
      }
    }
  }, [ref, pulseRange, pulseDuration, radius, opacity]);

  return (
    <mesh 
      position={position} 
      ref={meshRef}
      scale={[radius, radius, radius]}
      {...meshProps}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial 
        ref={materialRef}
        color={color}
        transparent={true}
        opacity={opacity}
        side={2}
        depthTest={true}
        depthWrite={false}
      />
    </mesh>
  );
});

LocationPing.displayName = 'LocationPing';

export default LocationPing;
