import { Canvas } from "@react-three/fiber";
import Myhal1 from "./myhal-objects/Myhal1";
import Myhal2 from "./myhal-objects/Myhal2";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles, Position } from "./styles";
import { useState, useRef } from "react";
import { Camera } from "three";

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
  const [floorPositions, setFloorPositions] = useState<FloorPositions>({
    myhal1: [0, 0, 0],
    myhal2: [0, 100, 0]
  });
  const [floorOpacity, setFloorOpacity] = useState<Opacity>({
    myhal1: 1,
    myhal2: 1
  });
  const cameraRef = useRef<Camera>(null);

  const updatePosition = (key: keyof FloorPositions, newPosition: Position) => {
    setFloorPositions(prev => ({
      ...prev,
      [key]: newPosition
    }));
  };

  const updateOpacity = (key: keyof Opacity, newOpacity: number) => {
    setFloorOpacity(prev => ({
      ...prev,
      [key]: newOpacity
    }));
  };

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(300, 300, 300);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={resetCamera}>Reset Camera</h1>
      </div>
      <Canvas 
          shadows
          style={canvasStyles}
          camera={{ position: cameraPosition }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
      >
          <ambientLight intensity={1} />
          <Myhal1 position={floorPositions.myhal1} opacity={floorOpacity.myhal1} />
          <Myhal2 position={floorPositions.myhal2} opacity={floorOpacity.myhal2} />
          <OrbitControls />
      </Canvas>
    </div>
  );
}