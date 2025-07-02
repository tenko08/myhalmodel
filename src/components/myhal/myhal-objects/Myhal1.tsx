import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useLoader } from "@react-three/fiber";

const loader = new GLTFLoader();

export default function Myhal1() {
    const gltf = useLoader(loader, "/models/myhal1.glb");
    return <primitive object={gltf.scene} />;
}