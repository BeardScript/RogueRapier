import RAPIER from '@dimforge/rapier3d-compat';
import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RogueRapier from '../../Lib/RogueRapier';
import RapierCollider from './RapierCollider';

export default class RapierCuboid extends RapierCollider {
  @RE.props.vector3() sizeOffset: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  worldScale = new THREE.Vector3();

  protected createShape(): void {
    this.object3d.getWorldScale(this.worldScale);

    let colliderDesc = RAPIER.ColliderDesc.cuboid(
      this.sizeOffset.x * (this.worldScale.x/2),
      this.sizeOffset.y * (this.worldScale.y/2),
      this.sizeOffset.z * (this.worldScale.z/2)
    );

    this.collider = RogueRapier.world.createCollider(colliderDesc, this.body);
  }
}

RE.registerComponent(RapierCuboid);
