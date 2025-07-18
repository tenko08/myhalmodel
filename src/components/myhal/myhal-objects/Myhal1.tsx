import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { Group, Mesh } from "three";

const loader = new GLTFLoader();

type Myhal1Props = ThreeElements['group'] & { opacity?: number };

const Myhal1 = forwardRef<Group, Myhal1Props>((props, ref) => {
    const { opacity = 1, ...groupProps } = props;
    const gltf = useLoader(loader, "/models/myhal1.glb");
    const originalOpacities = useRef<Map<Mesh, number>>(new Map());
    const originalTransparent = useRef<Map<Mesh, boolean>>(new Map());
    const originalDepthWrite = useRef<Map<Mesh, boolean>>(new Map());
    
    useEffect(() => {
        gltf.scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (!originalOpacities.current.has(child)) {
                    originalOpacities.current.set(child, child.material.opacity);
                    originalTransparent.current.set(child, child.material.transparent);
                    originalDepthWrite.current.set(child, child.material.depthWrite);
                }
                
                const originalOpacity = originalOpacities.current.get(child) || 1;
                const wasTransparent = originalTransparent.current.get(child) || false;
                const wasDepthWrite = originalDepthWrite.current.get(child) ?? true;
                const newOpacity = originalOpacity * opacity;
                    
                child.material.transparent = wasTransparent || opacity < 1;
                
                if (wasTransparent) {
                    child.material.depthWrite = wasDepthWrite;
                } else if (opacity < 1) {
                    child.material.depthWrite = opacity === 1;
                } else {
                    child.material.depthWrite = wasDepthWrite;
                }
                
                if (wasTransparent) {
                    child.renderOrder = 1;
                }
                
                child.material.needsUpdate = true;
                child.material.opacity = newOpacity;
            }
        });
    }, [gltf, opacity]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Myhal1.displayName = 'Myhal1';

export default Myhal1;