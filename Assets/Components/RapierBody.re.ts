import RAPIER from '@dimforge/rapier3d-compat';
import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RogueRapier from '../Lib/RogueRapier';

export default class RapierBody extends RE.Component {
  @RE.props.select() type = 0;
  typeOptions = ["Dynamic", "Fixed", "KinematicPositionBased", "KinematicVelocityBased"];
  @RE.props.num() mass = 1;

  private _gravityScale = 1;
  @RE.props.num()
  get gravityScale() {
    return this._gravityScale;
  }

  set gravityScale(value: number) {
    this._gravityScale = value;
    this.body && (this.body.setGravityScale(value, true));
  }
  
  private _angularDamping = 0;
  @RE.props.num() 
  get angularDamping() {
    return this._angularDamping;
  }

  set angularDamping(value: number) {
    this._angularDamping = value;
    this.body && (this.body.setAngularDamping(value));
  }

  private _linearDamping = 0;
  @RE.props.num()
  get linearDamping() {
    this.body
    return this._linearDamping;
  }

  set linearDamping(value: number) {
    this._linearDamping = value;
    this.body && (this.body.setLinearDamping(value));
  }

  private _xTranslation = true;
  @RE.props.checkbox() 
  get xTranslation() {
    return this._xTranslation;
  }

  set xTranslation(value: boolean) {
    this._xTranslation = value;
    this.body && (this.body.restrictTranslations(value, this._yTranslation, this._zTranslation, true));
  }

  private _yTranslation = true;
  @RE.props.checkbox() 
  get yTranslation() {
    return this._yTranslation;
  }

  set yTranslation(value: boolean) {
    this._yTranslation = value;
    this.body && (this.body.restrictTranslations(this._xTranslation, value, this._zTranslation, true));
  }

  private _zTranslation = true;
  @RE.props.checkbox() 
  get zTranslation() {
    return this._zTranslation;
  }

  set zTranslation(value: boolean) {
    this._zTranslation = value;
    this.body && (this.body.restrictTranslations(this._xTranslation, this._yTranslation, value, true));
  }

  private _xRotation = true;
  @RE.props.checkbox() 
  get xRotation() {
    return this._xRotation;
  }

  set xRotation(value: boolean) {
    this._xRotation = value;
    this.body && (this.body.restrictRotations(value, this._yRotation, this._zRotation, true));
  }

  private _yRotation = true;
  @RE.props.checkbox() 
  get yRotation() {
    return this._yRotation;
  }

  set yRotation(value: boolean) {
    this._yRotation = value;
    this.body && (this.body.restrictRotations(this._xRotation, value, this._zRotation, true));
  }

  private _zRotation = true;
  @RE.props.checkbox() 
  get zRotation() {
    return this._zRotation;
  }

  set zRotation(value: boolean) {
    this._zRotation = value;
    this.body && (this.body.restrictTranslations(this._xRotation, this._yRotation, value, true));
  }

  body: RAPIER.RigidBody;
  initialized = false;

  private newPos = new THREE.Vector3();
  private newRot = new THREE.Quaternion();
  private matrixA = new THREE.Matrix4();
  private matrixB = new THREE.Matrix4();
  private matrixC = new THREE.Matrix4();

  init() {
    let rigidBodyDesc = this.getType();

    const pos = this.object3d.position;
    const rot = this.object3d.quaternion;
  
    rigidBodyDesc
    .setGravityScale(this._gravityScale)
    .setTranslation(pos.x, pos.y, pos.z)
    .setRotation(rot)
    .setAngularDamping(this._angularDamping)
    .setLinearDamping(this._linearDamping)
    .restrictRotations(this._xRotation, this._yRotation, this._zRotation)
    .restrictTranslations(this._xTranslation, this._yTranslation, this._zTranslation);

    rigidBodyDesc.mass = this.mass;

    this.body = RogueRapier.world.createRigidBody(rigidBodyDesc);

    this.initialized = true;
  }

  private getType() {
    if (Number(this.type) === 1) return RAPIER.RigidBodyDesc.fixed();
    else if (Number(this.type) === 2) return RAPIER.RigidBodyDesc.kinematicPositionBased();
    else if (Number(this.type) === 3) return RAPIER.RigidBodyDesc.kinematicVelocityBased();
    else return RAPIER.RigidBodyDesc.dynamic();
  }

  beforeUpdate(): void {
    if (!RogueRapier.initialized) return;
    !this.initialized && this.init();

    this.type !== RAPIER.RigidBodyType.Fixed && 
    this.updatePhysics();
  }

  updatePhysics() {
    this.copyBodyPosition();
    this.copyBodyRotation();
  }

  private copyBodyPosition() {
    const pos = this.body.translation();
    this.newPos.set(pos.x, pos.y, pos.z);
    
    this.object3d.parent?.worldToLocal(this.newPos);
    this.object3d.position.copy(this.newPos);
  }

  private copyBodyRotation() {
    const rot = this.body.rotation();
    this.newRot.set(rot.x, rot.y, rot.z, rot.w);

    this.matrixA.makeRotationFromQuaternion(this.newRot);
    this.object3d.updateMatrixWorld();
    this.matrixB.copy((this.object3d.parent as THREE.Object3D).matrixWorld).invert();
    this.matrixC.extractRotation(this.matrixB);
    this.matrixA.premultiply(this.matrixC);
    this.object3d.quaternion.setFromRotationMatrix(this.matrixA);
  }
}

RE.registerComponent(RapierBody);
