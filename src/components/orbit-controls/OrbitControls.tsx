import React from "react";
import { OrbitControls, OrbitControlsProps } from "@react-three/drei";

function Controls(props: OrbitControlsProps) {
  return <OrbitControls {...props} enableZoom={true} enablePan={false} />;
}

export default Controls;