import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { forwardRef, useEffect, useRef } from "react";
import { Group, Mesh, Material } from "three";

const loader = new GLTFLoader();

type Myhal1Props = ThreeElements['group'] & { opacity?: number };

const Myhal1 = forwardRef<Group, Myhal1Props>((props, ref) => {
    const { opacity = 1, ...groupProps } = props;
    const gltf = useLoader(loader, "/models/myhal1.glb");
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

        // Sort meshes by their z position to ensure consistent rendering
        meshes.sort((a, b) => b.position.z - a.position.z);
        
        // Update materials with consistent render order
        meshes.forEach((child, index) => {
            if (!(child.material instanceof Material)) return;
            
            const originalOpacity = originalOpacities.current.get(child) || 1;
            const wasTransparent = originalTransparent.current.get(child) || false;
            const wasDepthWrite = originalDepthWrite.current.get(child) ?? true;
            const newOpacity = originalOpacity * opacity;
            const isNowTransparent = wasTransparent || opacity < 1;
            
            // Always enable transparency during transitions
            child.material.transparent = true;
            child.material.opacity = newOpacity;
            
            // Maintain depth writing for all objects
            child.material.depthWrite = true;
            
            // Set render order based on sorted position
            child.renderOrder = index;
            
            child.material.needsUpdate = true;
        });
    }, [gltf, opacity]);
    
    return <group ref={ref} {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
});

Myhal1.displayName = 'Myhal1';

export default Myhal1;