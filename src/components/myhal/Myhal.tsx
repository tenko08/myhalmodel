import { Canvas } from "@react-three/fiber";
import OrbitControls from "@/components/orbit-controls/OrbitControls";
import { canvasStyles } from "./styles";
import { useRef, useState } from "react";
import { Camera } from "three";
import * as THREE from "three";
import LightBulb from "./myhal-objects/Lightbulb";
import Floor from "./myhal-objects/Floor";
import OpacityBox from "./myhal-objects/OpacityBox";
import { 
  defaultFloorPositions, 
  defaultCameraPosition, 
  cameraPositions,
  floorMovementAnimationDuration,
  type FloorPositions,
  opacityBoxConfigs,
  pingLocationConfigs
} from "./config";
import PingLocation from "./myhal-objects/PingLocation";

interface Opacity {
  myhal1: number;
  myhal2: number;
  myhal150: number;
}

interface FloorRef extends THREE.Group {
  animateToPosition: (targetPosition: THREE.Vector3, duration: number, onComplete?: () => void) => void;
  animateOpacity: (targetOpacity: number, duration: number) => void;
}

export default function Myhal() {
  const [floorOpacity, setFloorOpacity] = useState<Opacity>({ // 0 is opaque, 1 is transparent (opposite of what it usually is)
    myhal1: 0,
    myhal2: 0,
    myhal150: 0
  });
  
  const cameraRef = useRef<Camera>(null);
  const myhal1Ref = useRef<FloorRef>(null);
  const myhal2Ref = useRef<FloorRef>(null);
  const myhal150Ref = useRef<FloorRef>(null);
  const opacityBox1Ref = useRef<THREE.Mesh & { animateToPosition: (targetPosition: THREE.Vector3, duration: number) => void }>(null);

  // Moves camera to target position over duration
  const animateCamera = (targetPosition: THREE.Vector3, duration: number) => {
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

  // -- Camera Controls --
  const resetCamera = () => {
    animateCamera(cameraPositions.default, floorMovementAnimationDuration);
  };

  const focusFloor1 = () => {
    animateCamera(cameraPositions.floor1View, floorMovementAnimationDuration);
  };

  // -- Floor Controls --
  const setFloor1Opacity = (value: number) => {
    setFloorOpacity(prev => ({
      ...prev,
      myhal1: value
    }));
  };

  const movementTest = () => {
    myhal1Ref.current?.animateToPosition(new THREE.Vector3(0, -100, 0), floorMovementAnimationDuration);
    opacityBox1Ref.current?.animateToPosition(opacityBoxConfigs.myhal1.animatedPosition, floorMovementAnimationDuration);
    setFloor1Opacity(1);
  };

  const movementUntest = () => {
    myhal1Ref.current?.animateToPosition(defaultFloorPositions.myhal1, floorMovementAnimationDuration);
    opacityBox1Ref.current?.animateToPosition(opacityBoxConfigs.myhal1.defaultPosition, floorMovementAnimationDuration);
    setFloor1Opacity(0);
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
          <Floor modelPath="/models/myhalF1.glb" ref={myhal1Ref} position={defaultFloorPositions.myhal1} />
          <OpacityBox 
            position={opacityBoxConfigs.myhal1.defaultPosition.toArray()} 
            size={opacityBoxConfigs.myhal1.size} 
            opacity={floorOpacity.myhal1}
            ref={opacityBox1Ref} 
          />
          <PingLocation position={pingLocationConfigs.defaultPosition.toArray()} />
          {/* <Floor modelPath="/models/myhalF2.glb" ref={myhal2Ref} position={defaultFloorPositions.myhal2} /> */}
          <Floor modelPath="/models/myhal150.glb" ref={myhal150Ref} position={defaultFloorPositions.myhal150} />
          {/* temporarily using myhal1.glb for both floors 1 and 2 (the myhal1 and myhal2 files are identical) */}
          <OrbitControls maxDistance={800} minDistance={100} 
          // minPolarAngle={0} maxPolarAngle={Math.PI / 3} 
          />
          {/* change to orthographic camera? */}
        </Canvas>
      </div>
    </div>
  );
}