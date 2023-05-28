import * as RE from 'rogue-engine';
import RogueRapier from '../Lib/RogueRapier';
import RapierBody from './RapierBody.re';

export default class Jump extends RE.Component {

  start() {
    const bodyComponent = RE.getComponent(RapierBody, this.object3d) as RapierBody;

    bodyComponent.onCollisionStart = (info) => {
      console.log("Start Collision", this.object3d.uuid, info);
    }

    bodyComponent.onCollisionEnd = (info) => {
      console.log("End Collision", this.object3d.uuid, info);
    }
  }

  beforeUpdate() {
    if (!RogueRapier.initialized) return;

    const bodyComponent = RE.getComponent(RapierBody, this.object3d);

    if (!bodyComponent || bodyComponent && !bodyComponent.initialized) return;

    if (!RE.Input.keyboard.getKeyDown("Space")) return;

    bodyComponent.body.applyImpulse({x: 0, y: 20, z: 0}, true);
  }
}

RE.registerComponent(Jump);
