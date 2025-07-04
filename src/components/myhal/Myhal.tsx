import { Canvas } from "@react-three/fiber";
import Myhal1 from "./myhal-objects/Myhal1";
import Myhal2 from "./myhal-objects/Myhal2";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles, Position } from "./styles";
import { useState } from "react";

interface FloorPositions {
  myhal1: Position;
  myhal2: Position;
}

interface Opacity {
  myhal1: number;
  myhal2: number;
}

export default function Myhal() {
  const [cameraPosition, setCameraPosition] = useState<Position>([300, 300, 300]);
  const [positions, setPositions] = useState<FloorPositions>({
    myhal1: [0, 0, 0],
    myhal2: [0, 100, 0]
  });
  const [opacity, setOpacity] = useState<Opacity>({
    myhal1: 1,
    myhal2: 1
  });

  const updatePosition = (key: keyof FloorPositions, newPosition: Position) => {
    setPositions(prev => ({
      ...prev,
      [key]: newPosition
    }));
  };

  const updateOpacity = (key: keyof Opacity, newOpacity: number) => {
    setOpacity(prev => ({
      ...prev,
      [key]: newOpacity
    }));
  };

  return (
    <Canvas 
        shadows
        style={canvasStyles}
        camera={{ position: cameraPosition }}
    >
        <ambientLight intensity={1} />
        <Myhal1 position={positions.myhal1} opacity={opacity.myhal1} />
        <Myhal2 position={positions.myhal2} opacity={opacity.myhal2} />
        <OrbitControls />
    </Canvas>
  );
}