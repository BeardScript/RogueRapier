import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RogueRapier from '../Lib/RogueRapier';

export default class RapierConfig extends RE.Component {
  @RE.props.vector3() gravity = new THREE.Vector3(0, -9.81, 0);

  awake() {
    RogueRapier.init().then(() => {
      RogueRapier.world.gravity = this.gravity;
    });
  }

  update() {
    if (!RogueRapier.initialized) return;

    RogueRapier.world.step();
  }
}

RE.registerComponent(RapierConfig);
