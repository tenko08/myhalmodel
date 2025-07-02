import { Canvas } from "@react-three/fiber";
import { sceneStyles, canvasStyles } from "./styles";
import Floor from "@/components/example-scene/example-scene-objects/Floor";
import Box from "@/components/example-scene/example-scene-objects/Box";
import LightBulb from "@/components/example-scene/example-scene-objects/Lightbulb";
import Controls from "@/components/orbit-controls/OrbitControls";

export default function ExampleScene() {
  return (
    <div style={sceneStyles}>
      <Canvas
        shadows
        style={canvasStyles}
        camera={{
          position: [-6, 7, 7],
        }}
      >
        <ambientLight intensity={0.2} />
        <Box rotateX={3} position={[0, 1, 0]} />
        <LightBulb position={[0, 3, 1]} />
        <Floor position={[0, -1, 0]} />
        <Controls />
      </Canvas>
    </div>
  );
}
