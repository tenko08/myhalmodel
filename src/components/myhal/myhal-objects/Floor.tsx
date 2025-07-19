import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { Group, Mesh, Material } from "three";

type FloorProps = ThreeElements['group'] & { 
    opacity?: number;
    modelPath: string;
};

const Floor = forwardRef<Group, FloorProps>((props, ref) => {
    const { opacity = 1, modelPath, ...groupProps } = props;
    const gltf = useLoader(GLTFLoader, modelPath);
    const originalOpacities = useRef<Map<Mesh, number>>(new Map());
    const originalTransparent = useRef<Map<Mesh, boolean>>(new Map());
    const originalDepthWrite = useRef<Map<Mesh, boolean>>(new Map());
    
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
                        originalTransparent.current.set(child, child.material.transparent || false);
                        originalDepthWrite.current.set(child, child.material.depthWrite ?? true);
                    }
                }
            }
        });

        meshes.sort((a, b) => b.position.z - a.position.z);
        
        meshes.forEach((child, index) => {
            if (!(child.material instanceof Material)) return;
            
            const originalOpacity = originalOpacities.current.get(child) || 1;
            const wasTransparent = originalTransparent.current.get(child) || false;
            const newOpacity = originalOpacity * opacity;
            
            child.material.transparent = true;
            child.material.opacity = newOpacity;
            
            child.material.depthWrite = true;
            
            child.renderOrder = index;
            
            child.material.needsUpdate = true;
        });
    }, [gltf, opacity]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Floor.displayName = 'Floor';

export default Floor;