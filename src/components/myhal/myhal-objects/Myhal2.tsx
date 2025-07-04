import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";
import { ThreeElements } from "@react-three/fiber";

const loader = new GLTFLoader();

export default function Myhal2(props: ThreeElements['group']) {
    const gltf = useLoader(loader, "/models/myhal1.glb");
    return <group {...props}><primitive object={gltf.scene} scale={100} /></group>;
}