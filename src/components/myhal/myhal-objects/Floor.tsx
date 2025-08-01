import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import * as THREE from "three";

type FloorProps = ThreeElements['group'] & { 
    modelPath: string;
    onAnimationComplete?: () => void;
};

const Floor = forwardRef<Group, FloorProps>((props, ref) => {
    const { modelPath, onAnimationComplete, ...groupProps } = props;
    const gltf = useLoader(GLTFLoader, modelPath);
    const mixer = useRef(new THREE.AnimationMixer(gltf.scene));
    const animationActions = useRef<THREE.AnimationAction[]>([]);
    
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
            };
        }
    }, [ref]);
    
    // render & set up meshes
    useEffect(() => {
        const meshes: Mesh[] = [];
        
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
            }
        });

        meshes.sort((a, b) => {return b.position.z - a.position.z;});
    }, [gltf]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Floor.displayName = 'Floor';

export default Floor;