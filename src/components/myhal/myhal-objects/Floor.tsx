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
    const animateToPosition = (targetPosition: THREE.Vector3, duration: number = 1, onComplete?: () => void) => {
        const scene = gltf.scene;
        const currentPosition = scene.position.clone();
        
        const times = [0, duration];
        const values = [...currentPosition.toArray(), ...targetPosition.toArray()];
        const positionTrack = new THREE.VectorKeyframeTrack(
            '.position',
            times,
            values
        );

        const clip = new THREE.AnimationClip('move', duration, [positionTrack]);
        
        animationActions.current.forEach(action => action.stop());
        animationActions.current = [];
        
        const action = mixer.current.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        
        // Add completion callback
        if (onComplete) {
            action.getClip().duration = duration;
            const checkComplete = () => {
                if (action.time >= duration) {
                    onComplete();
                } else {
                    requestAnimationFrame(checkComplete);
                }
            };
            checkComplete();
        }
        
        action.play();
        animationActions.current.push(action);
    };

    // opacity animation function
    const animateOpacity = (targetOpacity: number, duration: number = 1) => {
        const meshes: Mesh[] = [];
        gltf.scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                meshes.push(child);
            }
        });

        meshes.forEach((mesh) => {
            if (!(mesh.material instanceof Material)) return;
            const originalOpacity = originalOpacities.current.get(mesh) || 1;
            const currentOpacity = mesh.material.opacity;
            const targetValue = originalOpacity * targetOpacity;

            const times = [0, duration];
            const values = [currentOpacity, targetValue];
            const opacityTrack = new THREE.NumberKeyframeTrack(
                `${mesh.uuid}.material.opacity`,
                times,
                values
            );

            const clip = new THREE.AnimationClip(`fade-${mesh.uuid}`, duration, [opacityTrack]);
            const action = mixer.current.clipAction(clip);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.play();
            animationActions.current.push(action);
        });
    };

    // update mixer in animation frame
    useEffect(() => {
        let frameId: number;
        const animate = (delta: number) => {
            mixer.current.update(delta);
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
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
                
                if (!originalOpacities.current.has(child)) {
                    if (child.material instanceof Material) {
                        originalOpacities.current.set(child, child.material.opacity || 1);
                        originalDepthWrite.current.set(child, child.material.depthWrite ?? true);
                    }
                }
            }
        });

        meshes.sort((a, b) => b.position.z - a.position.z);

    }, [gltf, opacity]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Floor.displayName = 'Floor';

export default Floor;