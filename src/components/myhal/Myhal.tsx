import { Canvas } from "@react-three/fiber";
import Myhal1 from "./myhal-objects/Myhal1";
import Myhal2 from "./myhal-objects/Myhal2";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles } from "./styles";

export default function Myhal() {
  return (
    <Canvas 
        shadows
        style={canvasStyles}
        camera={{ position: [0, 0, 10] }}
    >
        <ambientLight intensity={1} />
        <Myhal1 position={[0, 0, 0]} />
        <Myhal2 position={[0, 100, 0]} />
        <OrbitControls />
    </Canvas>
  );
}