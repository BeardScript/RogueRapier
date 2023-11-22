import * as RE from "rogue-engine";
import * as RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import RapierCollider from "@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierCollider";
import RogueRapier from "@RE/RogueEngine/rogue-rapier/Lib/RogueRapier";
import RapierBody from "@RE/RogueEngine/rogue-rapier/Components/RapierBody.re";

export default class RapierKinematicCharacterController extends RapierBody {
  static interface = {}; // prevent inheritance of parent class prop controls.
  @RE.props.num() offset = 0.1;
  @RE.props.num() maxSlopeClimbingAngle = 5;
  @RE.props.num() minSlopeSlidingAngle = 25;
  @RE.props.num() autostepMaxHeight = 0.7;
  @RE.props.num() autostepMinWidth = 0.3;
  @RE.props.checkbox() autostepIncludeDynamicBodies = true;
  @RE.props.num() snapToGroundDistance = 0.3;
  @RE.props.num() characterMass = 10;
  @RE.props.checkbox() applyImpulsesToDynamicBodies = true;
  @RE.props.checkbox() slideEnabled = true;
  @RE.props.num() jumpHeight = 2;
  @RE.props.num() jumpSpeed = 1;
  @RE.props.num() speed = 0.1;

  @RE.props.num()
  get gravityScale() {
    return this._gravityScale;
  }

  set gravityScale(value: number) {
    this._gravityScale = value;
    RE.Runtime.isRunning && this.body && this.body.setGravityScale(value, true);
  }

  characterController: RAPIER.KinematicCharacterController;
  characterColliders: RapierCollider[] = [];
  movementDirection = new THREE.Vector3();
  playerVelocity = new THREE.Vector3();

  private gravity = new THREE.Vector3();
  private jumpYStart = 0;
  private isJumping = false;

  init() {
    this.type = RAPIER.RigidBodyType.KinematicPositionBased;
    super.init();
    //https://github.com/dimforge/rapier.js/blob/master/testbed3d/src/demos/characterController.ts
    this.characterController = RogueRapier.world.createCharacterController(this.offset)
    this.characterController.enableAutostep(this.autostepMaxHeight, this.autostepMinWidth, this.autostepIncludeDynamicBodies)
    this.characterController.enableSnapToGround(this.snapToGroundDistance)
    this.characterController.setCharacterMass(this.characterMass)
    this.characterController.setApplyImpulsesToDynamicBodies(this.applyImpulsesToDynamicBodies)
    this.characterController.setSlideEnabled(this.slideEnabled)
    this.characterController.setMaxSlopeClimbAngle(this.maxSlopeClimbingAngle);
    this.characterController.setMinSlopeSlideAngle(this.minSlopeSlidingAngle);
  }

  beforeUpdate() {
    super.beforeUpdate();
    if (!RogueRapier.initialized) return;
    !this.initialized && this.init();

    if (this.body?.numColliders() < 1) return;

    if (this.characterColliders.length !== this.body.numColliders()) {
      this.characterColliders = [];
      RE.traverseComponents((component) => {
        if (!(component instanceof RapierCollider)) return;
        if (component.body !== this.body) return;
        this.characterColliders.push(component);
        component.collider.setTranslationWrtParent(component.object3d.position);
      });
    }

    this.handleKinematicPositionBased();
  }

  update() {
    super.update();
    if (this.body?.numColliders() < 1) {
      RE.Debug.logWarning("No character collider");
      return;
    }
  }

  handleKinematicPositionBased() {
    this.playerVelocity.set(
      this.movementDirection.x,
      0,
      this.movementDirection.z
    );
    this.playerVelocity.normalize();
    this.playerVelocity.multiplyScalar(
      this.speed * this.movementDirection.length() * RE.Runtime.deltaTime
    );

    const nextPosition = this.body.translation();
    const isGrounded = this.characterController.computedGrounded();

    if (isGrounded && this.movementDirection.y != 0) {
      this.isJumping = true;
      this.jumpYStart = nextPosition.y;
    }

    if (this.isJumping && nextPosition.y - this.jumpYStart >= this.jumpHeight) {
      this.isJumping = false;
    }

    const gravity = RogueRapier.world.gravity;
    this.gravity.set(gravity.x, this.isJumping ? this.jumpSpeed : gravity.y, gravity.z);
    this.playerVelocity.addScaledVector(this.gravity, this.gravityScale * RE.Runtime.deltaTime);

    for (let i = 0; i < this.body.numColliders(); i++) {
      this.characterController.computeColliderMovement(
        this.body.collider(i),
        this.playerVelocity,
      );
    }

    const characterMovement = this.characterController.computedMovement();

    nextPosition.x += characterMovement.x;
    nextPosition.y += characterMovement.y;
    nextPosition.z += characterMovement.z;

    this.body.setNextKinematicTranslation(nextPosition);
  }
}

RE.registerComponent(RapierKinematicCharacterController);
