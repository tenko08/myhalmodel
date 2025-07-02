import { Canvas } from "@react-three/fiber";
import Myhal1 from "./myhal-objects/Myhal1";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles } from "./styles";

export default function Myhal() {
  return (
    <Canvas 
        shadows
        style={canvasStyles}
        camera={{ position: [0, 0, 10] }}
    >
        <ambientLight intensity={0.5} />
        <Myhal1 />
        <OrbitControls />
    </Canvas>
  );
}