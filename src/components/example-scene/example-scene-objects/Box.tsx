import { ThreeElements } from "@react-three/fiber";
import React from "react";

function Box(props: ThreeElements['mesh']) {
  return (
    <mesh {...props} receiveShadow castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial  color={"blue"} />
    </mesh>
  );
}

export default Box;
