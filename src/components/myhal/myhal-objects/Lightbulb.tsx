import { ThreeElements } from "@react-three/fiber";
import React from "react";

function LightBulb(props: ThreeElements['mesh']) {
  return (
    <mesh {...props} >
      <pointLight 
        castShadow 
        intensity={200} 
        distance={5000}
        decay={1}
        color="white"
        shadow-mapSize={4096}
        shadow-bias={-0.001}
      />
      <sphereGeometry args={[0.2, 30, 10]} />
      <meshPhysicalMaterial 
        emissive={"yellow"} 
        emissiveIntensity={1}
        toneMapped={false}
      />
    </mesh>
  );
}

export default LightBulb;

