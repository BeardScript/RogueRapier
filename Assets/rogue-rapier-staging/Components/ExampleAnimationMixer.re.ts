import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RapierKinematicCharacterController from '@RE/RogueEngine/rogue-rapier/Components/RapierKinematicCharacterController.re';

export default class ExampleAnimationMixer extends RE.Component {
  @RE.props.animation() idleClip: THREE.AnimationClip;
  @RE.props.animation() runClip: THREE.AnimationClip;
  @RE.props.animation() jumpClip: THREE.AnimationClip;

  animationMixer = new THREE.AnimationMixer(this.object3d);

  idleAction: THREE.AnimationAction;
  runAction: THREE.AnimationAction;
  jumpAction: THREE.AnimationAction;

  activeAction: THREE.AnimationAction;

  private _characterController: RapierKinematicCharacterController;

  get characterController() {
    if (!this._characterController) {
      return RE.getComponent(RapierKinematicCharacterController, this.object3d);
    }
    return this._characterController;
  }

  start() {
    this.idleAction = this.createAction(this.idleClip) as THREE.AnimationAction;
    this.runAction = this.createAction(this.runClip) as THREE.AnimationAction;
    this.jumpAction = this.createAction(this.jumpClip) as THREE.AnimationAction;

    this.jumpAction.setLoop(THREE.LoopOnce, 1);
    this.jumpAction.clampWhenFinished = true;
    this.jumpClip.duration = 0.15;
  }

  createAction(clip: THREE.AnimationClip) {
    if (!clip) return;

    const action = this.animationMixer.clipAction(clip);
    action.play();
    this.setWeight(action, 0);

    return action;
  }

  update() {
    const vSpeed = Math.abs(this.characterController.playerVelocity.y);
    const isJumping = this.characterController.isJumping;
    const isGrounded = this.characterController.isGrounded;

    if (isJumping || !isGrounded && vSpeed > 0.2) {
      this.activeAction !== this.jumpAction && this.mix(this.jumpAction);
    }
    else if (this.isMoving()) {
      if (this.activeAction === this.runAction) {
        this.runAction.setEffectiveWeight(this.characterController.movementDirection.length());
      } else {
        this.mix(this.runAction);
      }
    }
    else {
      this.activeAction !== this.idleAction && this.mix(this.idleAction);
    }

    this.animationMixer.update(RE.Runtime.deltaTime);
  }

  isMoving() {
    const dir = this.characterController.movementDirection;
    return Math.abs(dir.x) > 0 || Math.abs(dir.z) > 0;
  }

  setWeight(action: THREE.AnimationAction, weight: number) {
    action.enabled = true;
    action.time = 0;
    action.setEffectiveWeight(weight);
  }

  mix(action: THREE.AnimationAction, transitionTime: number = 0.1, warp = true, weight = 1) {
    if (!this.activeAction) {
      this.activeAction = action;
    }

    this.activeAction.reset();
    this.activeAction.enabled = true;

    this.setWeight(action, weight);

    action.reset();
    action.crossFadeFrom(this.activeAction, transitionTime, warp);
    action.setEffectiveTimeScale(1);

    this.activeAction = action;
  }
}

RE.registerComponent(ExampleAnimationMixer);
        