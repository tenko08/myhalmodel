import { Canvas } from "@react-three/fiber";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles } from "./styles";
import { useRef, useState } from "react";
import { Camera, Vector3, Group } from "three";
import * as THREE from "three";
import LightBulb from "./myhal-objects/Lightbulb";
import Floor from "./myhal-objects/Floor";

interface Positions {
  myhal1: THREE.Vector3;
  myhal2: THREE.Vector3;
}

interface Opacity {
  myhal1: number;
  myhal2: number;
}

interface FloorRef extends THREE.Group {
  animateToPosition: (targetPosition: THREE.Vector3, duration: number, onComplete?: () => void) => void;
  animateOpacity: (targetOpacity: number, duration: number) => void;
}

export default function Myhal() {
  const defaultCameraPosition = new THREE.Vector3(400, 200, 400);
  const [floorPositions, setFloorPositions] = useState<Positions>({
    myhal1: new THREE.Vector3(0, 0, 0),
    myhal2: new THREE.Vector3(0, 100, 0)
  });
  const [floorOpacity, setFloorOpacity] = useState<Opacity>({
    myhal1: 1,
    myhal2: 1
  });
  
  const cameraRef = useRef<Camera>(null);
  const myhal1Ref = useRef<FloorRef>(null);
  const myhal2Ref = useRef<FloorRef>(null);

  // Moves camera to target position over duration
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

  // Animates the opacity of a floor over duration
  const animateOpacity = (targetOpacity: number, duration: number, floor: keyof Opacity) => {
    const startTime = Date.now();
    const startOpacity = floorOpacity[floor];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newOpacity = startOpacity + (targetOpacity - startOpacity) * easeProgress;
      setFloorOpacity(prev => ({ ...prev, [floor]: newOpacity }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Animates the position of a floor over duration
  const animatePosition = (targetPosition: Vector3, duration: number, floor: keyof Positions) => {
    const startTime = Date.now();
    const startPosition = floorPositions[floor].clone();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newPosition = new THREE.Vector3();
      newPosition.lerpVectors(startPosition, targetPosition, easeProgress);
      setFloorPositions(prev => ({ ...prev, [floor]: newPosition }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // -- Camera Controls --
  const resetCamera = () => {
    animateCamera(defaultCameraPosition, 1000);
  };

  const focusFloor1 = () => {
    animateCamera(new THREE.Vector3(300, 300, 300), 1000);
  };

  // const movementTest = () => {
  //   animatePosition(new THREE.Vector3(0, -100, 0), 1000, 'myhal1');
  //   animateOpacity(0, 1000, 'myhal1');
  // };

  const movementTest = () => {
    myhal1Ref.current?.animateToPosition(new THREE.Vector3(0, -100, 0), 1000);
    myhal1Ref.current?.animateOpacity(0, 1000);
  };

  // const movementUntest = () => {
  //   animateOpacity(1, 1000, 'myhal1');
  //   animatePosition(new THREE.Vector3(0, 0, 0), 1000, 'myhal1');
  // };

  const movementUntest = () => {
    myhal1Ref.current?.animateToPosition(new THREE.Vector3(0, 0, 0), 1000);
    myhal1Ref.current?.animateOpacity(1, 1000);
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
        <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={movementTest}>
          Movement Test
        </h1>
        <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={movementUntest}>
          Movement Untest
        </h1>
      </div>
      <div
        style={{
          ...canvasStyles,
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
          pointerEvents: "auto",
        }}
        draggable={false}
        onDragStart={e => e.preventDefault()}
      >
        <Canvas
          shadows
          style={{ width: "100vw", height: "100vh", background: "#fff", pointerEvents: "auto" }}
          camera={{ position: defaultCameraPosition }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
        >
          <ambientLight intensity={2} />
          <LightBulb position={[400, 180, 350]} />
          <Floor modelPath="/models/myhal1.glb" ref={myhal1Ref} position={floorPositions.myhal1} opacity={floorOpacity.myhal1} />
          <Floor modelPath="/models/myhal2.glb" ref={myhal2Ref} position={floorPositions.myhal2} opacity={floorOpacity.myhal2} />
          {/* temporarily using myhal1.glb for both floors 1 and 2 (the myhal1 and myhal2 files are identical) */}
          <OrbitControls maxDistance={800} minDistance={100} />
        </Canvas>
      </div>
    </div>
  );
}