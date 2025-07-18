import { Canvas } from "@react-three/fiber";
import Myhal1 from "./myhal-objects/Myhal1";
import Myhal2 from "./myhal-objects/Myhal2";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles } from "./styles";
import { useRef } from "react";
import { Camera, Vector3 } from "three";
import * as THREE from "three";

interface FloorPositions {
  myhal1: THREE.Vector3;
  myhal2: THREE.Vector3;
}

interface Opacity {
  myhal1: number;
  myhal2: number;
}

export default function Myhal() {
  const defaultCameraPosition = new THREE.Vector3(400, 200, 400);
  const defaultFloorPositions: FloorPositions = {
    myhal1: new THREE.Vector3(0, 0, 0),
    myhal2: new THREE.Vector3(0, 100, 0)
  };
  const defaultFloorOpacity: Opacity = {
    myhal1: 1,
    myhal2: 1
  };
  const cameraRef = useRef<Camera>(null);

  const animateCamera = (targetPosition: Vector3, duration: number) => {
    if (cameraRef.current) {
      const camera = cameraRef.current;
      const startTime = Date.now();
      const startPosition = camera.position.clone();
      const currentPosition = new THREE.Vector3();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        currentPosition.lerpVectors(startPosition, targetPosition, easeProgress);
        camera.position.copy(currentPosition);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  const resetCamera = () => {
    animateCamera(defaultCameraPosition, 1000);
  };

  const focusFloor1 = () => {
    animateCamera(new THREE.Vector3(300, 300, 300), 1000);
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={resetCamera}>
          Reset Camera
        </h1>
        <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={focusFloor1}>
          Focus Floor 1
        </h1>
      </div>
      <Canvas 
          shadows
          style={canvasStyles}
          camera={{ position: defaultCameraPosition }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
      >
          <ambientLight intensity={1} />
          <Myhal1 position={defaultFloorPositions.myhal1} opacity={defaultFloorOpacity.myhal1} />
          <Myhal2 position={defaultFloorPositions.myhal2} opacity={defaultFloorOpacity.myhal2} />
          <OrbitControls maxDistance={800} minDistance={100} />
      </Canvas>
    </div>
  );
}