import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RapierKinematicCharacterController from '@RE/RogueEngine/rogue-rapier/Components/RapierKinematicCharacterController.re';

export default class RapierFirstPersonController extends RE.Component {
  @RE.props.vector3() cameraOffset = new THREE.Vector3(0, 1.6, 0.2);
  @RE.props.num() minPolarAngle = -60;
  @RE.props.num() maxPolarAngle = 70;
  @RE.props.num() near = 0.1;
  @RE.props.num() far = 500;
  @RE.props.num() fov = 50;
  @RE.props.num() gamepadIndex = 0;
  @RE.props.num(0, 1) axisSensitivity = 0.5;
  @RE.props.num(0, 1) mouseSensitivity = 0.3;
  
  cameraHandle = new THREE.Object3D();
  camera = new THREE.PerspectiveCamera();

  private localFWD = new THREE.Vector3();
  private appliedDirection = new THREE.Vector3();
  private dummy = new THREE.Object3D();
  private camDirection = new THREE.Vector3();
  private targetDirection = new THREE.Vector3();
  private camRotationX = 0;
  private inputDirection = new THREE.Vector3();
  private inputVelocity = new THREE.Vector3();

  private _characterController: RapierKinematicCharacterController;

  get characterController() {
    if (!this._characterController) {
      return RE.getComponent(RapierKinematicCharacterController, this.object3d);
    }
    return this._characterController;
  }

  get gamepad() {
    return RE.Input.gamepads[this.gamepadIndex];
  }

  awake() {
    if (!RE.Runtime.isRunning) return;

    this.camera = new THREE.PerspectiveCamera();
    this.cameraHandle.add(this.camera);
    this.object3d.add(this.cameraHandle);
    this.camera.rotateY(THREE.MathUtils.degToRad(180));

    this.setCameraSettings();

    RE.App.activeCamera = this.camera.uuid;
  }

  start() {
    RE.Runtime.rogueDOMContainer.onclick = () => RE.Runtime.isRunning && RE.Input.mouse.lock();
  }

  update() {
    this.object3d.getWorldDirection(this.localFWD);

    this.characterController.movementDirection.x = 0
    this.characterController.movementDirection.y = 0
    this.characterController.movementDirection.z = 0

    this.moveCamera();
    this.setRotation();
    this.translate();

    this.setCameraSettings();
  }

  moveCamera() {
    if (!this.cameraHandle) return;

    this.cameraHandle.position.y = this.cameraOffset.y;
    this.cameraHandle.position.z = this.cameraOffset.z;

    let rvAxis = this.getCameraVertical();

    this.camRotationX = rvAxis * RE.Runtime.deltaTime;

    this.cameraHandle.rotateX(this.camRotationX);

    const maxPolarAngle = THREE.MathUtils.degToRad(this.maxPolarAngle);
    const minPolarAngle = THREE.MathUtils.degToRad(this.minPolarAngle);

    if (this.cameraHandle.rotation.x > maxPolarAngle) {
      this.cameraHandle.rotation.x = maxPolarAngle;
    }

    if (this.cameraHandle.rotation.x < minPolarAngle) {
      this.cameraHandle.rotation.x = minPolarAngle;
    }
  }

  setRotation() {
    let hAxis = -this.getHorizontal();
    let vAxis = -this.getVertical();
    let rhAxis = this.getCameraHorizontal();

    this.inputDirection.set(hAxis, 0, vAxis);
    this.inputDirection.length() > 1 && this.inputDirection.normalize();

    if (this.inputDirection.length() === 0) {
      this.camDirection.set(0, 0, 1);
    } else {
      this.camDirection.copy(this.inputDirection);
    }

    this.object3d.localToWorld(this.camDirection);
    this.camDirection.sub(this.object3d.position);
    this.camDirection.normalize();

    this.appliedDirection.copy(this.object3d.position).add(this.camDirection);
    this.dummy.position.copy(this.object3d.position);
    this.dummy.lookAt(this.appliedDirection);
    this.dummy.getWorldDirection(this.targetDirection);

    this.object3d.rotateY(-rhAxis * RE.Runtime.deltaTime);

    this.characterController.body.setRotation(this.object3d.quaternion, true);
  }

  translate() {
    this.inputVelocity.z = this.inputDirection.length();
    this.targetDirection.multiplyScalar(this.inputVelocity.length());

    this.characterController.movementDirection.set(
      this.targetDirection.x,
      this.getJumpInput(),
      this.targetDirection.z,
    )
  }

  getCameraHorizontal() {
    if (this.gamepad) {
      const rhAxis = this.gamepad.getAxis(2);

      if (Math.abs(rhAxis) > 0.1) return rhAxis * 10 * this.axisSensitivity;
    }

    return RE.Input.mouse.movementX * this.mouseSensitivity * 0.2;
  }

  getCameraVertical() {
    if (this.gamepad) {
      const rvAxis = this.gamepad.getAxis(3);

      if (Math.abs(rvAxis) > 0.1) return rvAxis * 10 * this.axisSensitivity;
    }

    return RE.Input.mouse.movementY * this.mouseSensitivity * 0.2;
  }

  getHorizontal() {
    if (RE.Input.keyboard.getKeyPressed("KeyA")) return -1;
    if (RE.Input.keyboard.getKeyPressed("KeyD")) return 1;

    if (this.gamepad && Math.abs(this.gamepad.getAxis(0)) > 0.1) {
      return this.gamepad.getAxis(0);
    }

    return 0;
  }

  getVertical() {
    if (RE.Input.keyboard.getKeyPressed("KeyW")) return -1;
    if (RE.Input.keyboard.getKeyPressed("KeyS")) return 1;

    if (this.gamepad && Math.abs(this.gamepad.getAxis(1)) > 0.1) {
      return this.gamepad.getAxis(1);
    }

    return 0;
  }

  getJumpInput() {
    return RE.Input.keyboard.getKeyDown("Space") || this.gamepad && this.gamepad.getButtonDown(3) ? 1 : 0;
  }

  setCameraSettings() {
    if (!this.camera) return;

    if (this.camera.near !== this.near) {
      this.camera.near = this.near;
      this.camera.updateProjectionMatrix();
    }

    if (this.camera.far !== this.far) {
      this.camera.far = this.far;
      this.camera.updateProjectionMatrix();
    }

    if (this.camera.fov !== this.fov) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }
}

RE.registerComponent(RapierFirstPersonController);
        