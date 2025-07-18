import React from "react";
import { OrbitControls } from "@react-three/drei";

function Controls(props: any) {
  return <OrbitControls {...props} enableZoom={true} enablePan={false} />;
}

export default Controls;