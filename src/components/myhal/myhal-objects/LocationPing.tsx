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
  radius = 100,
  opacity = 1,
  color = '#ff0000',
  animationSpeed = 0.2,
  pulseRange = 100,
  pulseDuration = 1000,
  ...meshProps
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const currentOpacityRef = useRef(1);
  const currentRadiusRef = useRef(radius);
  const mixer = useRef(new AnimationMixer(new Mesh()));
  const pulseActionRef = useRef<AnimationAction | null>(null);

  // opacity animation
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

    // update animation mixer
    mixer.current.update(0.016); // approximate for 60fps

    if (meshRef.current.scale.x !== currentRadiusRef.current) {
      meshRef.current.scale.set(
        currentRadiusRef.current,
        currentRadiusRef.current,
        currentRadiusRef.current
      );
    }
  });

  // pulse animation
  useEffect(() => {
    if (!meshRef.current) return;

    mixer.current = new AnimationMixer(meshRef.current);

    const times = [0, 0.5, 1];
    const values = [1, 1 + pulseRange, 1];

    const scaleTrack = new NumberKeyframeTrack(
      '.scale[x]',
      times,
      values
    );

    const yScaleTrack = new NumberKeyframeTrack(
      '.scale[y]',
      times,
      values
    );

    const zScaleTrack = new NumberKeyframeTrack(
      '.scale[z]',
      times,
      values
    );

    const clip = new AnimationClip('pulse', pulseDuration / 1000, [scaleTrack, yScaleTrack, zScaleTrack]);
    const action = mixer.current.clipAction(clip, meshRef.current);
    action.setLoop(LoopRepeat, Infinity);
    pulseActionRef.current = action;

    if (ref) {
      const mesh = meshRef.current as LocationPingRef;
      mesh.startPulsing = () => {
        pulseActionRef.current?.reset().play();
      };
      mesh.stopPulsing = () => {
        pulseActionRef.current?.stop();
        if (meshRef.current) {
          meshRef.current.scale.set(1, 1, 1);
        }
      };
      
      if (typeof ref === 'function') {
        ref(mesh);
      } else {
        ref.current = mesh;
      }
    }

    return () => {
      pulseActionRef.current?.stop();
      mixer.current.stopAllAction();
    };
  }, [ref, pulseRange, pulseDuration]);

  return (
    <mesh 
      position={position} 
      ref={meshRef}
      scale={[1, 1, 1]}
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
