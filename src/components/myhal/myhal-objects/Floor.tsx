import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { Group, Mesh, Material } from "three";
import * as THREE from "three";
import { ShaderCallNodeInternal } from "three/src/nodes/TSL.js";

type MaterialData = {
    material: Material;
    trackName: string;
    originalOpacity: number;
};

type MeshData = {
    mesh: Mesh;
    materials: MaterialData[];
};

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
    const meshDataCache = useRef<MeshData[]>([]);
    
    // animation function
    const animateToPosition = (targetPosition: THREE.Vector3, durationMs: number = 1000, onComplete?: () => void) => {
        const scene = gltf.scene;
        
        const duration = durationMs / 1000;
        
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
        
        const currentPosition = scene.position.clone();
        const times = [0, 1];
        const values = [...currentPosition.toArray(), ...targetPosition.toArray()];
        
        const positionTrack = new THREE.VectorKeyframeTrack(
            '.position',
            times,
            values
        );

        const clip = new THREE.AnimationClip('move', duration, [positionTrack]);
        const action = mixer.current.clipAction(clip);
        
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        
        if (onComplete) {
            const onFinish = (e: any) => {
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
    };

    // opacity animation function
    const animateOpacity = (targetOpacity: number, durationMs: number = 1000) => {
        const duration = durationMs / 1000;

        // Stop any existing opacity animations
        animationActions.current = animationActions.current.filter(action => {
            if (action.getClip().name === 'opacity') {
                action.fadeOut(0.1);
                setTimeout(() => {
                    action.stop();
                    mixer.current.uncacheAction(action.getClip());
                }, 100);
                return false;
            }
            return true;
        });

        const tracks: THREE.KeyframeTrack[] = [];
        
        meshDataCache.current.forEach(({ mesh, materials }) => {
            materials.forEach(({ material, trackName, originalOpacity }) => {
                const currentOpacity = material.opacity;
                const scaledTargetOpacity = targetOpacity * originalOpacity;

                if (scaledTargetOpacity < currentOpacity && material.transparent !== true) {
                    material.transparent = true;
                }

                const times = [0, duration];
                const values = [currentOpacity, scaledTargetOpacity];
                
                const track = new THREE.NumberKeyframeTrack(
                    trackName,
                    times,
                    values
                );
                tracks.push(track);
            });
        });

        if (tracks.length > 0) {
            const clip = new THREE.AnimationClip('opacity', duration, tracks);
            const action = mixer.current.clipAction(clip);
            
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            
            action.fadeIn(0.1);
            action.play();
            animationActions.current.push(action);
        }
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
        const newMeshDataCache: MeshData[] = [];
        
        // pre-initialize the animation mixer
        const dummyTrack = new THREE.NumberKeyframeTrack(
            '.scale.x',
            [0],
            [1]
        );
        const dummyClip = new THREE.AnimationClip('init', 0, [dummyTrack]);
        const dummyAction = mixer.current.clipAction(dummyClip);
        dummyAction.play();
        mixer.current.update(0);
        dummyAction.stop();
        mixer.current.uncacheAction(dummyClip);
        
        // render the scene and cache material data
        gltf.scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                meshes.push(child);
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material.opacity < 1) {
                    child.material.transparent = true;
                    child.material.depthWrite = false;
                }

                const materials = Array.isArray(child.material) ? child.material : [child.material];
                const materialDataArray: MaterialData[] = [];
                
                materials.forEach((material, index) => {
                    if (material instanceof Material) {
                        if (!originalOpacities.current.has(child)) {
                            const originalOpacity = material.opacity ?? 1;
                            originalOpacities.current.set(child, originalOpacity);
                            material.transparent = originalOpacity < 1;
                        }

                        // cache material data
                        const trackName = Array.isArray(child.material) 
                            ? `${child.name}.material[${index}].opacity`
                            : `${child.name}.material.opacity`;

                        materialDataArray.push({
                            material,
                            trackName,
                            originalOpacity: originalOpacities.current.get(child) ?? 1
                        });
                    }
                });

                newMeshDataCache.push({
                    mesh: child,
                    materials: materialDataArray
                });
            }
        });

        meshes.sort((a, b) => {
            const aTransparent = a.material instanceof Material ? a.material.transparent : (Array.isArray(a.material) ? a.material[0].transparent : false);
            const bTransparent = b.material instanceof Material ? b.material.transparent : (Array.isArray(b.material) ? b.material[0].transparent : false);
            
            if (aTransparent !== bTransparent) {
                return aTransparent ? 1 : -1;
            }
            
            return b.position.z - a.position.z;
        });
        meshDataCache.current = newMeshDataCache;

    }, [gltf, opacity]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Floor.displayName = 'Floor';

export default Floor;