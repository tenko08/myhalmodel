import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { Group, Mesh, Material } from "three";
import * as THREE from "three";

type FloorProps = ThreeElements['group'] & { 
    opacity?: number;
    modelPath: string;
    onAnimationComplete?: () => void;
};

const Floor = forwardRef<Group, FloorProps>((props, ref) => {
    const { opacity = 1, modelPath, onAnimationComplete, ...groupProps } = props;
    const gltf = useLoader(GLTFLoader, modelPath);
    const mixer = useRef(new THREE.AnimationMixer(gltf.scene));
    const animationActions = useRef<THREE.AnimationAction[]>([]);

    const originalOpacities = useRef<Map<Mesh, number>>(new Map());
    const originalDepthWrite = useRef<Map<Mesh, boolean>>(new Map());
    
    // animation function
    const animateToPosition = (targetPosition: THREE.Vector3, durationMs: number = 1000, onComplete?: () => void) => {
        const scene = gltf.scene;
        const currentPosition = scene.position.clone();
        
        // Convert milliseconds to seconds for Three.js animation system
        const duration = durationMs / 1000;
        
        // Create keyframe track with normalized time (0 to 1)
        const times = [0, 1];
        const values = [...currentPosition.toArray(), ...targetPosition.toArray()];
        const positionTrack = new THREE.VectorKeyframeTrack(
            '.position',
            times,
            values
        );

        const clip = new THREE.AnimationClip('move', duration, [positionTrack]);
        
        animationActions.current.forEach(action => {
            action.stop();
            mixer.current.uncacheAction(clip, scene);
        });
        animationActions.current = [];
        
        const action = mixer.current.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        
        // Add completion callback
        if (onComplete) {
            const onFinish = (e: any) => {
                if (e.action === action) {
                    onComplete();
                    mixer.current.removeEventListener('finished', onFinish);
                }
            };
            mixer.current.addEventListener('finished', onFinish);
        }
        
        action.play();
        animationActions.current.push(action);
    };

    // opacity animation function
    const animateOpacity = (targetOpacity: number, durationMs: number = 1000) => {
        const duration = durationMs / 1000;
        const meshes: Mesh[] = [];
        
        gltf.scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                meshes.push(child);
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach(material => {
                    if (material instanceof Material) {
                        const originalOpacity = originalOpacities.current.get(child) || 1;
                        // Material should be transparent if it was originally transparent or if we're fading out
                        material.transparent = originalOpacity < 1 || targetOpacity < 1;
                    }
                });
            }
        });

        meshes.forEach((mesh) => {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            materials.forEach((material, index) => {
                if (!(material instanceof Material)) return;
                
                const originalOpacity = originalOpacities.current.get(mesh) || 1;
                const currentOpacity = material.opacity;
                const targetValue = targetOpacity === 1 ? originalOpacity : originalOpacity * targetOpacity;

                const times = [0, duration];
                const values = [currentOpacity, targetValue];
                
                // Create unique track name for each material
                const trackName = Array.isArray(mesh.material) 
                    ? `${mesh.uuid}.material[${index}].opacity`
                    : `${mesh.uuid}.material.opacity`;
                
                const opacityTrack = new THREE.NumberKeyframeTrack(
                    trackName,
                    times,
                    values
                );

                const clip = new THREE.AnimationClip(`fade-${mesh.uuid}-${index}`, duration, [opacityTrack]);
                const action = mixer.current.clipAction(clip);
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                action.play();
                animationActions.current.push(action);
            });
        });
    };

    // update mixer in animation frame
    useEffect(() => {
        let frameId: number;
        let lastTime = 0;
        
        const animate = (currentTime: number) => {
            if (lastTime === 0) lastTime = currentTime;
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            mixer.current.update(deltaTime);
            frameId = requestAnimationFrame(animate);
        };
        
        frameId = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(frameId);
            lastTime = 0;
        };
    }, []);

    // expose animation methods through ref
    useEffect(() => {
        if (ref) {
            const refCurrent = ref as any;
            refCurrent.current = {
                ...refCurrent.current,
                animateToPosition,
                animateOpacity
            };
        }
    }, [ref]);
    
    // render & set up meshes
    useEffect(() => {
        const meshes: Mesh[] = [];
        
        gltf.scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                meshes.push(child);
                child.castShadow = true;
                child.receiveShadow = true;
                
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach(material => {
                    if (material instanceof Material) {
                        if (!originalOpacities.current.has(child)) {
                            const originalOpacity = material.opacity ?? 1;
                            originalOpacities.current.set(child, originalOpacity);
                            material.transparent = originalOpacity < 1;
                        }
                    }
                });
            }
        });

        meshes.sort((a, b) => b.position.z - a.position.z);

    }, [gltf, opacity]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Floor.displayName = 'Floor';

export default Floor;