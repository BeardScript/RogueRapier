import * as RE from 'rogue-engine';
import RapierKinematicCharacterController from './RapierKinematicCharacterController.re';

export default class RapierKeyboardInput extends RE.Component {
  characterController: RapierKinematicCharacterController
  awake() {

  }

  start() {
    const component = RE.getComponent(RapierKinematicCharacterController, this.object3d)
    if(component) {
      this.characterController = component
    }

  }

  update() {
    this.characterController.movementDirection.x = 0
    this.characterController.movementDirection.y = 0
    this.characterController.movementDirection.z = 0
    if (RE.Input.keyboard.getKeyPressed("KeyW")) {
      this.characterController.movementDirection.x = 1
    }
    if (RE.Input.keyboard.getKeyPressed("KeyA")) {
      this.characterController.movementDirection.z = -1
    }
    if (RE.Input.keyboard.getKeyPressed("KeyS")) {
      this.characterController.movementDirection.x = -1
    }
    if (RE.Input.keyboard.getKeyPressed("KeyD")) {
      this.characterController.movementDirection.z = 1
    }
    if (RE.Input.keyboard.getKeyPressed("Space")) {
      this.characterController.movementDirection.y = 1
    }
  }
}

RE.registerComponent(RapierKeyboardInput);
        