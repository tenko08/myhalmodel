import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Mesh } from "three";

const loader = new GLTFLoader();

type Myhal2Props = ThreeElements['group'] & { opacity?: number };

export default function Myhal2(props: Myhal2Props) {
    const { opacity = 1, ...groupProps } = props;
    const gltf = useLoader(loader, "/models/myhal1.glb");
    const originalOpacities = useRef<Map<Mesh, number>>(new Map());
    
    // -- Opacity control --
    // we need this because theres already transparent objects in the model
    useEffect(() => {
        gltf.scene.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (!originalOpacities.current.has(child)) {
                    originalOpacities.current.set(child, child.material.opacity);
                }
                
                const originalOpacity = originalOpacities.current.get(child) || 1;
                const newOpacity = originalOpacity * opacity;
                
                child.material.transparent = newOpacity < 1;
                child.material.opacity = newOpacity;
            }
        });
    }, [gltf, opacity]);

    // -- Render --
    return <group {...groupProps}><primitive object={gltf.scene} scale={100} /></group>;
}