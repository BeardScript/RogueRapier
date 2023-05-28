import RAPIER from '@dimforge/rapier3d-compat';
import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RogueRapier from '../../Lib/RogueRapier';
import RapierBody from '../RapierBody.re';

export default abstract class RapierCollider extends RE.Component {
  initialized = false;
  collider: RAPIER.Collider;
  body: RAPIER.RigidBody;
  bodyComponent: RapierBody;

  localPos: THREE.Vector3 = new THREE.Vector3();
  worldPos = new THREE.Vector3();

  localRot = new THREE.Quaternion();
  worldQuaternion = new THREE.Quaternion();

  @RE.props.checkbox() isSensor = false;
  @RE.props.checkbox() collisionEvents = false;

  private matrixA = new THREE.Matrix4();
  private matrixB = new THREE.Matrix4();
  private matrixC = new THREE.Matrix4();

  static findByShape(shape: RAPIER.Collider) {
    let shapeComponent: undefined | RapierCollider;

    RE.traverseComponents(component => {
      if (shapeComponent) return;

      if (component instanceof RapierCollider && component.collider === shape) {
        shapeComponent = component;
      }
    });

    return shapeComponent;
  }

  init() {
    this.bodyComponent = this.getBodyComponent(this.object3d) as RapierBody;

    if (!this.bodyComponent) return;
    if (!this.bodyComponent.body) return;

    this.body = this.bodyComponent.body;

    this.createShape();

    this.collider.setSensor(this.isSensor);
    this.collisionEvents && this.collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    this.setColliderPos();
    this.setColliderRot();

    this.initialized = true;
  }

  setColliderPos() {
    this.object3d.updateWorldMatrix(true, true);
    this.object3d.getWorldPosition(this.worldPos);
    this.localPos.copy(this.worldPos);
    this.bodyComponent.object3d.updateWorldMatrix(true, true);
    this.bodyComponent.object3d.worldToLocal(this.localPos);

    this.collider.setTranslationWrtParent(this.localPos);
  }

  setColliderRot() {
    this.object3d.updateWorldMatrix(true, true);
    this.object3d.getWorldQuaternion(this.worldQuaternion);

    this.matrixA.makeRotationFromQuaternion(this.worldQuaternion);
    this.object3d.updateWorldMatrix(true, true);
    this.matrixB.copy(this.bodyComponent.object3d.matrixWorld).invert();
    this.matrixC.extractRotation(this.matrixB);
    this.matrixA.premultiply(this.matrixC);
    this.localRot.setFromRotationMatrix(this.matrixA);

    this.collider.setRotationWrtParent(this.localRot);
  }

  beforeUpdate(): void {
    if (!RogueRapier.initialized) return;
    if (!this.initialized) this.init();
  }

  onDisabled() {
    RogueRapier.world.removeCollider(this.collider, false);
  }

  onBeforeObjectRemoved() {
    RogueRapier.world.removeCollider(this.collider, false);
  }

  getBodyComponent(object3d: THREE.Object3D): RapierBody | undefined {
    const bodyComponent = RE.getComponent(RapierBody, object3d);

    if (bodyComponent) {
      return bodyComponent;
    }

    if (!object3d.parent) return;

    return this.getBodyComponent(object3d.parent as THREE.Object3D);
  }

  protected createShape(): void {};
}
