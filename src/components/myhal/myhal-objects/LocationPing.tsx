import { Mesh, Material, Vector3, AnimationMixer, VectorKeyframeTrack, AnimationClip, LoopOnce, AnimationAction } from 'three';
import { useRef, useEffect, forwardRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { ThreeElements } from '@react-three/fiber';

type PingLocationProps = {
  radius?: number;
  opacity?: number;
  color?: string;
  animationSpeed?: number;
} & ThreeElements['mesh'];

interface PingLocationRef extends Mesh {
  animateToPosition: (targetPosition: Vector3, duration: number, onComplete?: () => void) => void;
}

const LocationPing = forwardRef<PingLocationRef, PingLocationProps>(({
  position = [0, 0, 0],
  radius = 100,
  opacity = 1,
  color = '#ff0000',
  animationSpeed = 0.2,
  ...meshProps
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const currentOpacityRef = useRef(0);
  const mixer = useRef(new AnimationMixer(new Mesh()));

  // Opacity animation
  useFrame(() => {
    if (!meshRef.current) return;
    
    const diff = opacity - currentOpacityRef.current;
    if (Math.abs(diff) > 0.001) {
      const newOpacity = currentOpacityRef.current + diff * animationSpeed;
      currentOpacityRef.current = newOpacity;
      
      const material = meshRef.current.material as Material & { opacity: number };
      if (material) {
        material.opacity = newOpacity;
      }
    }

    // Update animation mixer
    mixer.current.update(0.016); // Approximate for 60fps
  });

  return (
    <mesh 
      position={position} 
      ref={meshRef}
      {...meshProps}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial 
        color={color}
        transparent={true}
        opacity={currentOpacityRef.current}
        toneMapped={false}
      />
    </mesh>
  );
});

LocationPing.displayName = 'LocationPing';

export default LocationPing;
