import { ThreeElements } from "@react-three/fiber";
import React from "react";

function Floor(props: ThreeElements['mesh']) {
  return (
    <mesh {...props} receiveShadow>
      <boxGeometry args={[20,1,10]} />
      <meshPhysicalMaterial color='white' />
    </mesh>
  );
}

export default Floor;
