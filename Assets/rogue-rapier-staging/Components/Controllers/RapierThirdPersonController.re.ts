import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import RogueRapier from '@RE/RogueEngine/rogue-rapier/Lib/RogueRapier';
import RapierKinematicCharacterController from '@RE/RogueEngine/rogue-rapier/Components/RapierKinematicCharacterController.re';

export default class RapierThirdPersonController extends RE.Component {
  @RE.props.object3d() target: THREE.Object3D;
  @RE.props.checkbox() lockCameraOnTarget = true;
  @RE.props.checkbox() avoidViewObstacles = true;
  @RE.props.checkbox() strafe = false;
  @RE.props.checkbox() turnWithCamera = false;
  @RE.props.checkbox() lockCamVertical = false;
  @RE.props.checkbox() lockCamHorizontal = false;
  @RE.props.vector3() cameraOffset = new THREE.Vector3(0, 2, 5);
  @RE.props.num() cameraHeight = 1;
  @RE.props.num() minPolarAngle = -60;
  @RE.props.num() maxPolarAngle = 70;
  @RE.props.num() near = 0.1;
  @RE.props.num() far = 500;
  @RE.props.num() fov = 50;
  @RE.props.num() gamepadIndex = 0;
  @RE.props.num(0, 1) hAxisSensitivity = 0.5;
  @RE.props.num(0, 1) vAxisSensitivity = 0.2;
  @RE.props.num(0, 1) mouseSensitivity = 0.5;
  
  cameraHandle = new THREE.Object3D();
  camera = new THREE.PerspectiveCamera();

  private cameraWorldPos = new THREE.Vector3();
  private localFWD = new THREE.Vector3();
  private appliedDirection = new THREE.Vector3();
  private dummy = new THREE.Object3D();
  private targettingDummy = new THREE.Object3D();
  private camDirection = new THREE.Vector3();
  private targetDirection = new THREE.Vector3();
  private camRotationX = 0;
  private targetDummyPosition = new THREE.Vector3();
  private camToObjectDir = new THREE.Vector3();
  private inputDirection = new THREE.Vector3();
  private inputVelocity = new THREE.Vector3();
  private rayOrigin = new THREE.Vector3();
  private camRay = new RAPIER.Ray({x:0,y:0,z:0}, {x:0,y:0,z:0});

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
    this.camera.position.set(0,0,0);
    this.camera.rotation.set(0,0,0);
    RE.Runtime.scene.add(this.cameraHandle);
    RE.App.activeCamera = this.camera.uuid;

    this.setCameraSettings();
  }

  start() {
    this.cameraHandle.position.copy(this.object3d.position);
    this.cameraHandle.quaternion.copy(this.object3d.quaternion);

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

  translate() {
    this.inputVelocity.z = this.inputDirection.length();
    this.targetDirection.multiplyScalar(this.inputVelocity.length());

    this.characterController.movementDirection.set(
      this.targetDirection.x,
      this.getJumpInput(),
      this.targetDirection.z,
    )
  }

  getJumpInput() {
    return RE.Input.keyboard.getKeyDown("Space") || this.gamepad && this.gamepad.getButtonDown(3) ? 1 : 0;
  }

  setRotation() {
    let hAxis = -this.getHorizontal();
    let vAxis = -this.getVertical();

    this.inputDirection.set(hAxis, 0, vAxis);
    this.inputDirection.length() > 1 && this.inputDirection.normalize();

    this.dummy.position.copy(this.object3d.position);

    if (this.cameraHandle) {
      if (this.inputDirection.length() === 0) {
        this.camDirection.set(0, 0, 1);
      } else {
        this.camDirection.copy(this.inputDirection);
      }
      this.cameraHandle.localToWorld(this.camDirection);
      this.camDirection.sub(this.cameraHandle.position);
      this.camDirection.normalize();
    }

    this.appliedDirection.copy(this.object3d.position).add(this.camDirection);

    if (this.inputDirection.length() > 0 || this.turnWithCamera || (this.target && !this.turnWithCamera)) {
      this.dummy.lookAt(this.appliedDirection);

      if (this.strafe) {
        this.object3d.quaternion.rotateTowards(this.cameraHandle.quaternion, 15 * RE.Runtime.deltaTime);
      }
      else if (this.target && !this.lockCameraOnTarget) {
        this.targettingDummy.position.copy(this.object3d.position);

        const oldTgtY = this.target.position.y;
        this.target.position.y = this.targettingDummy.position.y;

        this.targettingDummy.lookAt(this.target.position);
        this.target.position.y = oldTgtY;

        this.object3d.quaternion.rotateTowards(this.targettingDummy.quaternion, 15 * RE.Runtime.deltaTime);
      }
      else {
        this.object3d.quaternion.rotateTowards(this.dummy.quaternion, 15 * RE.Runtime.deltaTime);
      }
    }

    this.dummy.getWorldDirection(this.targetDirection);

    this.characterController.body.setRotation(this.object3d.quaternion, true);
  }

  moveCamera() {
    if (!this.cameraHandle) return;

    let rvAxis = this.getCameraVertical();
    let rhAxis = this.getCameraHorizontal();

    if (this.target && this.lockCameraOnTarget) {
      rvAxis = 0;
      rhAxis = 0;
    }

    if (this.lockCamVertical) rvAxis = 0;
    if (this.lockCamHorizontal) rhAxis = 0;

    this.camRotationX += rvAxis * RE.Runtime.deltaTime;

    const maxPolarAngle = THREE.MathUtils.degToRad(this.maxPolarAngle);
    const minPolarAngle = THREE.MathUtils.degToRad(this.minPolarAngle);

    if (this.camRotationX < minPolarAngle) this.camRotationX = minPolarAngle;
    if (this.camRotationX > maxPolarAngle) this.camRotationX = maxPolarAngle;

    this.cameraHandle.position.copy(this.object3d.position);

    this.cameraHandle.rotateY(-rhAxis * RE.Runtime.deltaTime);
    this.cameraHandle.rotateX(this.camRotationX);

    if (this.target) {
      this.cameraHandle.lookAt(this.target.position);
    }

    this.cameraHandle.translateY(this.cameraHeight);
    this.cameraHandle.translateZ(-this.cameraOffset.z);

    this.avoidViewObstacles && this.avoidCameraObstacles();

    this.cameraHandle.rotateX(-this.camRotationX);

    if (this.target && this.lockCameraOnTarget) {
      this.cameraHandle.rotation.x = 0;

      this.targetDummyPosition.copy(this.target.position);
      this.targetDummyPosition.y = this.cameraHandle.position.y;
  
      this.cameraHandle.lookAt(this.targetDummyPosition);
    }

    this.object3d.translateY(this.cameraOffset.y);
    this.object3d.translateX(-this.cameraOffset.x);
    this.camera.lookAt(this.object3d.position);
    this.object3d.translateY(-this.cameraOffset.y);
    this.object3d.translateX(this.cameraOffset.x);

    this.camera.position.x = -this.cameraOffset.x;
  }

  avoidCameraObstacles() {
    this.camera.getWorldPosition(this.cameraWorldPos);

    this.rayOrigin.copy(this.object3d.position);
    this.rayOrigin.y += this.cameraOffset.y;

    this.camToObjectDir.subVectors(this.rayOrigin, this.cameraWorldPos).normalize().negate();
    this.camRay.dir = this.camToObjectDir;
    this.camRay.origin = this.rayOrigin;

    const _ = undefined;
    const maxToi = this.object3d.position.distanceTo(this.cameraWorldPos);
    const hit = RogueRapier.world.castRay(this.camRay, maxToi, false, _,_,_, this.characterController.body);

    if (hit) {
      const point = this.camRay.pointAt(hit.timeOfImpact);
      this.cameraHandle.position.set(point.x, point.y, point.z);
      this.cameraHandle.position.sub(this.camera.position);
    }
  }

  getCameraHorizontal() {
    if (this.gamepad) {
      const rhAxis = this.gamepad.getAxis(2);

      if (Math.abs(rhAxis) > 0.1) return rhAxis * 10 * this.hAxisSensitivity;
    }

    return RE.Input.mouse.movementX * this.mouseSensitivity;
  }

  getCameraVertical() {
    if (this.gamepad) {
      const rvAxis = this.gamepad.getAxis(3);

      if (Math.abs(rvAxis) > 0.1) return rvAxis * 10 * this.vAxisSensitivity;
    }

    return RE.Input.mouse.movementY * this.mouseSensitivity;
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

RE.registerComponent(RapierThirdPersonController);
        