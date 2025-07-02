import React from "react";
import { OrbitControls } from "@react-three/drei";

function Controls(props: any) {
  return <OrbitControls {...props} enableZoom={true} />;
}

export default Controls;