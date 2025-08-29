import { Mesh, Material, AnimationMixer, NumberKeyframeTrack, AnimationClip, LoopRepeat, AnimationAction } from 'three';
import { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ThreeElements } from '@react-three/fiber';

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
  const currentOpacityRef = useRef(opacity);
  const currentRadiusRef = useRef(radius);
  const mixer = useRef<AnimationMixer | null>(null);
  const pulseActionRef = useRef<AnimationAction | null>(null);
  const materialRef = useRef<Material | null>(null);
  const isAnimatingRef = useRef(false);

  // opacity animation
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Only animate opacity if we're not in the pulse animation
    if (!isAnimatingRef.current) {
      const diff = opacity - currentOpacityRef.current;
      if (Math.abs(diff) > 0.001) {
        const newOpacity = currentOpacityRef.current + diff * animationSpeed;
        currentOpacityRef.current = newOpacity;
        
        if (materialRef.current) {
          (materialRef.current as any).opacity = newOpacity;
        }
      }
    }

    // update animation mixer
    if (mixer.current) {
      mixer.current.update(0.016); // approximate for 60fps
    }
  });

  // pulse animation
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

    mixer.current = new AnimationMixer(meshRef.current);

    const times = [0, 0.5, 1];
    const scaleValues = [1, 1 + pulseRange, 1];
    const opacityValues = [0.7, 0.2, 0.7];

    const xScaleTrack = new NumberKeyframeTrack(
      '.scale[x]',
      times,
      scaleValues
    );

    const yScaleTrack = new NumberKeyframeTrack(
      '.scale[y]',
      times,
      scaleValues
    );

    const zScaleTrack = new NumberKeyframeTrack(
      '.scale[z]',
      times,
      scaleValues
    );

    const opacityTrack = new NumberKeyframeTrack(
      '.material.opacity',
      times,
      opacityValues
    );

    const clip = new AnimationClip('pulse', pulseDuration / 1000, [xScaleTrack, yScaleTrack, zScaleTrack, opacityTrack]);
    const action = mixer.current.clipAction(clip, meshRef.current);
    action.setLoop(LoopRepeat, Infinity);
    pulseActionRef.current = action;

    if (ref) {
      const mesh = meshRef.current as LocationPingRef;
      mesh.startPulsing = () => {
        console.log('Starting pulse animation');
        if (pulseActionRef.current) {
          isAnimatingRef.current = true;
          pulseActionRef.current.reset().play();
        }
      };
      mesh.stopPulsing = () => {
        console.log('Stopping pulse animation');
        if (pulseActionRef.current) {
          pulseActionRef.current.stop();
        }
        isAnimatingRef.current = false;
        if (meshRef.current) {
          meshRef.current.scale.set(radius, radius, radius);
        }
        if (materialRef.current) {
          (materialRef.current as any).opacity = 0;
        }
        currentOpacityRef.current = 0;
      };
      
      if (typeof ref === 'function') {
        ref(mesh);
      } else {
        ref.current = mesh;
      }
    }

    return () => {
      if (pulseActionRef.current) {
        pulseActionRef.current.stop();
      }
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [ref, pulseRange, pulseDuration, radius, opacity]);

  return (
    <mesh 
      position={position} 
      ref={meshRef}
      scale={[radius, radius, radius]}
      {...meshProps}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={color}
        transparent={true}
        opacity={opacity}
        toneMapped={false}
        emissive={color}
        emissiveIntensity={0.2}
        side={2}
      />
    </mesh>
  );
});

LocationPing.displayName = 'LocationPing';

export default LocationPing;
