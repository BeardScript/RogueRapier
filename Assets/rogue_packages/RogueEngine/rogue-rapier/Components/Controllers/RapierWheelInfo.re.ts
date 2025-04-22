import * as RE from 'rogue-engine';
import * as THREE from 'three';

@RE.registerComponent
export default class RapierWheelInfo extends RE.Component {
  @RE.props.object3d() wheel: THREE.Object3D;
  @RE.props.checkbox() steer = false;
  @RE.props.checkbox() traction = true;
  @RE.props.num(0, 1) brake = 0.5;
  @RE.props.num(0, 1) handbrake = 0.5;
  @RE.props.num() radius = 0.5;
  @RE.props.num() frictionSlip = 10.5;
  @RE.props.num() sideFrictionStiffness = 1;
  @RE.props.num() suspensionRestLength = 0.05;
  @RE.props.num() suspensionRelaxation = 0.87;
  @RE.props.num() suspensionStiffness = 75;
  @RE.props.num() maxSuspensionTravel = 1;
  @RE.props.vector3() suspensionDirection = new THREE.Vector3(0, -1, 0);
  @RE.props.vector3() axleCs = new THREE.Vector3(0, 0, -1);
}
