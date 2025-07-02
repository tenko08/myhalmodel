import { ThreeElements } from "@react-three/fiber";
import React from "react";

function LightBulb(props: ThreeElements['mesh']) {
  return (
    <mesh {...props} >
      <pointLight castShadow intensity={5} />
      <sphereGeometry args={[0.2, 30, 10]} />
      <meshPhysicalMaterial emissive={"yellow"} emissiveIntensity={2} />
    </mesh>
  );
}

export default LightBulb;

