import { Mesh, Material, Vector3, AnimationMixer, VectorKeyframeTrack, AnimationClip, LoopOnce, AnimationAction } from 'three';
import { useRef, useEffect, forwardRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { ThreeElements } from '@react-three/fiber';

type OpacityBoxProps = {
  size?: [number, number, number];
  opacity?: number;
  color?: string;
  animationSpeed?: number;
} & ThreeElements['mesh'];

interface OpacityBoxRef extends Mesh {
  animateToPosition: (targetPosition: Vector3, duration: number, onComplete?: () => void) => void;
}

const OpacityBox = forwardRef<OpacityBoxRef, OpacityBoxProps>(({
  position = [0, 0, 0],
  size = [1, 1, 1],
  opacity = 0,
  color = '#ffffff',
  animationSpeed = 0.2,
  ...meshProps
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const currentOpacityRef = useRef(0);
  const mixer = useRef(new AnimationMixer(new Mesh()));
  const animationActions = useRef<AnimationAction[]>([]);

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

  // Position animation function
  const animateToPosition = useCallback((targetPosition: Vector3, durationMs: number = 1000, onComplete?: () => void) => {
    if (!meshRef.current) return;

    const duration = durationMs / 1000;
    
    // Clear existing move animations
    animationActions.current = animationActions.current.filter(action => {
      if (action.getClip().name === 'move') {
        action.fadeOut(0.1);
        setTimeout(() => {
          action.stop();
          mixer.current.uncacheAction(action.getClip());
        }, 100);
        return false;
      }
      return true;
    });

    const currentPosition = meshRef.current.position.clone();
    const times = [0, 1];
    const values = [...currentPosition.toArray(), ...targetPosition.toArray()];

    const positionTrack = new VectorKeyframeTrack(
      '.position',
      times,
      values
    );

    const clip = new AnimationClip('move', duration, [positionTrack]);
    const action = mixer.current.clipAction(clip, meshRef.current);

    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;

    if (onComplete) {
      const onFinish = (e: { action: AnimationAction }) => {
        if (e.action === action) {
          onComplete();
          mixer.current.removeEventListener('finished', onFinish);
        }
      };
      mixer.current.addEventListener('finished', onFinish);
    }

    action.fadeIn(0.1);
    action.play();
    animationActions.current.push(action);
  }, []);

  // Expose animation method through ref
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Update mixer target
    mixer.current = new AnimationMixer(meshRef.current);
    
    // Expose methods via ref
    if (ref) {
      const refCurrent = ref as unknown as React.RefObject<{ animateToPosition: (targetPosition: Vector3, duration: number) => void }>;
      refCurrent.current = {
        ...meshRef.current,
        animateToPosition,
      };
    }
  }, [ref, animateToPosition]);

  return (
    <mesh 
      position={position} 
      ref={meshRef}
      {...meshProps}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial 
        color={color}
        transparent={true}
        opacity={currentOpacityRef.current}
        toneMapped={false}
      />
    </mesh>
  );
});

OpacityBox.displayName = 'OpacityBox';

export default OpacityBox;