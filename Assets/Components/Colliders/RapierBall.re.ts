import RAPIER from '@dimforge/rapier3d-compat';
import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RogueRapier from '../../Lib/RogueRapier';
import RapierCollider from './RapierCollider';

export default class RapierBall extends RapierCollider {
  @RE.props.num() radiusOffset: number = 0;

  worldScale = new THREE.Vector3();

  protected createShape(): void {
    this.object3d.getWorldScale(this.worldScale);
    const maxSide = Math.max(this.worldScale.x, this.worldScale.y, this.worldScale.z);

    let colliderDesc = RAPIER.ColliderDesc.ball(this.radiusOffset + maxSide);
    this.collider = RogueRapier.world.createCollider(colliderDesc, this.body.handle);
  }
}

RE.registerComponent(RapierBall);
