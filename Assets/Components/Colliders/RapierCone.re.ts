import RAPIER from '@dimforge/rapier3d-compat';
import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RogueRapier from '../../Lib/RogueRapier';
import RapierCollider from './RapierCollider';

export default class RapierCone extends RapierCollider {
  @RE.props.num() halfHeight = 0.5;
  @RE.props.num() radius = 0.5;

  worldScale = new THREE.Vector3();

  protected createShape(): void {
    this.object3d.getWorldScale(this.worldScale);
    const maxSide = Math.max(this.worldScale.x, this.worldScale.z);

    let colliderDesc = RAPIER.ColliderDesc.cone(this.halfHeight * this.worldScale.y, this.radius * maxSide);
    this.collider = RogueRapier.world.createCollider(colliderDesc, this.body.handle);
  }
}

RE.registerComponent(RapierCone);
