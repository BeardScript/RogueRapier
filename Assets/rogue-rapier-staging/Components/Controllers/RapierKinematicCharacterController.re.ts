import * as RE from 'rogue-engine'
import * as RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import RapierCollider from '@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierCollider'
import RogueRapier from '@RE/RogueEngine/rogue-rapier/Lib/RogueRapier'
import RapierBody from '@RE/RogueEngine/rogue-rapier/Components/RapierBody.re'
import RapierConfig from '@RE/RogueEngine/rogue-rapier/Components/RapierConfig.re'

export default class RapierKinematicCharacterController extends RE.Component {
  @RE.props.num() offset = 0.1
  @RE.props.num() autostepMaxHeight = 0.7
  @RE.props.num() autostepMinWidth = 0.3
  @RE.props.checkbox() autostepIncludeDynamicBodies = true
  @RE.props.num() snapToGroundDistance = 0.3
  @RE.props.num() characterMass = 10
  @RE.props.checkbox() applyImpulsesToDynamicBodies = true
  @RE.props.checkbox() slideEnabled = true
  @RE.props.num() jumpHeight = 10
  @RE.props.select() type = 0;
  typeOptions = ["KinematicPositionBased", "KinematicVelocityBased"];

  
  initialized = false
  characterController: RAPIER.KinematicCharacterController

  @RE.props.num() speed = 0.1
  characterColliders: RapierCollider[] = []
  movementDirection = new THREE.Vector3(0.0, 0.0, 0.0)
  rapierBodyComponent: RapierBody
  rapierConfig: RapierConfig

  //https://github.com/dimforge/rapier.js/blob/master/testbed3d/src/demos/characterController.ts
  awake() {
    this.rapierConfig = RE.getComponent(RapierConfig) as RapierConfig
    this.rapierBodyComponent = RE.getComponent(RapierBody, this.object3d) as RapierBody  
  }

  start() {

  }

  beforeUpdate(): void {
    if (!RogueRapier.initialized) return;
    !this.initialized && this.init();
  }

  init() {
    this.characterController = RogueRapier.world.createCharacterController(this.offset)
    this.characterController.enableAutostep(this.autostepMaxHeight, this.autostepMinWidth, this.autostepIncludeDynamicBodies)
    this.characterController.enableSnapToGround(this.snapToGroundDistance)
    this.characterController.setCharacterMass(this.characterMass)
    this.characterController.setApplyImpulsesToDynamicBodies(this.applyImpulsesToDynamicBodies)
    this.characterController.setSlideEnabled(this.slideEnabled)
  }

  update() {
    if (!this.rapierBodyComponent.body) {
      RE.Debug.logWarning("No character body")
      return
    }

    if (this.rapierBodyComponent.body.numColliders() < 1) {
      RE.Debug.logWarning("No character collider")
      return
    }


    switch (this.type) {
      case 0:
        this.handleKinematicPositionBased()
        break;
      case 1:
        this.handleKinematicVelocityBased()
        break;
    }
  }

  handleKinematicPositionBased() {
    
    const gravity = this.rapierConfig.gravity
    const fixedStep = RE.Runtime.deltaTime

    const playerVelocity = new THREE.Vector3(0, 0, 0)

    const scaledMovement = new THREE.Vector3(this.movementDirection.x, 0, this.movementDirection.z)
    scaledMovement.normalize()

    playerVelocity.x = scaledMovement.x * this.speed
    playerVelocity.z = scaledMovement.z * this.speed
    const nextPosition = this.rapierBodyComponent.body.translation()
    const isGrounded = this.characterController.computedGrounded()

    if (isGrounded) {
      RE.Debug.log(`grounded`)
    }

    if (isGrounded && playerVelocity.y != 0) {
      playerVelocity.y = 0
    }

    if (isGrounded && this.movementDirection.y != 0) {
      RE.Debug.log("jumping")
      playerVelocity.y += Math.sqrt(
        this.jumpHeight * 3 * (gravity.y * fixedStep),
      )
    }

    playerVelocity.x += gravity.x * fixedStep
    playerVelocity.y += gravity.y * fixedStep
    playerVelocity.z += gravity.z * fixedStep

    this.characterController.computeColliderMovement(
      this.rapierBodyComponent.body.collider(0),
      playerVelocity,
    )

    const characterMovement = this.characterController.computedMovement()

    nextPosition.x += characterMovement.x
    nextPosition.y += characterMovement.y
    nextPosition.z += characterMovement.z

    this.rapierBodyComponent.body.setNextKinematicTranslation(nextPosition)
  }

  handleKinematicVelocityBased() {
    RE.Debug.logError("Does not support Kinematic Velocity at this time.")
  }
}

RE.registerComponent(RapierKinematicCharacterController);
