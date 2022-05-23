import * as RE from 'rogue-engine';
import RogueRapier from '../Lib/RogueRapier';
import RapierBody from './RapierBody.re';

export default class Jump extends RE.Component {
  update() {
    if (!RogueRapier.initialized) return;

    if (!RE.Input.keyboard.getKeyDown("Space")) return;

    const bodyComponent = RE.getComponent(RapierBody, this.object3d);

    if (!bodyComponent || bodyComponent && !bodyComponent.initialized) return;

    bodyComponent.body.applyImpulse({x: 0, y: 20, z: 0}, true);
  }
}

RE.registerComponent(Jump);
