import * as THREE from "three";

export interface FloorPositions {
  myhal1: THREE.Vector3;
  myhal2: THREE.Vector3;
  myhal150: THREE.Vector3;
}

export const defaultFloorPositions: FloorPositions = {
  myhal1: new THREE.Vector3(0, 0, 0),
  myhal2: new THREE.Vector3(0, 100, 0),
  myhal150: new THREE.Vector3(0, 100, -334)
};

export const defaultCameraPosition = new THREE.Vector3(400, 200, 400);

export const cameraPositions = {
  default: defaultCameraPosition,
  floor1View: new THREE.Vector3(300, 300, 300),
};

export interface OpacityBoxConfig {
  defaultPosition: THREE.Vector3;
  size: [number, number, number];
  animatedPosition: THREE.Vector3;
}

export const opacityBoxConfigs = {
  myhal1: {
    defaultPosition: new THREE.Vector3(0, 20, 0),
    size: [500, 100, 500] as [number, number, number],
    animatedPosition: new THREE.Vector3(0, -80, 0)
  }
};

export const locationPingConfigs = {
  size: [500, 100, 500] as [number, number, number],
  defaultPosition: new THREE.Vector3(0, 0, 0),
  myhal1: {
    frontDesk: new THREE.Vector3(0, 0, 0),
  }
};

export const floorMovementAnimationDuration = 1000; // milliseconds 