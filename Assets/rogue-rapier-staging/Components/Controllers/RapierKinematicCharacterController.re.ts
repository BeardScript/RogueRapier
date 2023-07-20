import * as RE from 'rogue-engine'
import * as RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import RapierCollider from '@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierCollider'
import RogueRapier from '@RE/RogueEngine/rogue-rapier/Lib/RogueRapier'
import RapierBody from '@RE/RogueEngine/rogue-rapier/Components/RapierBody.re'

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


  initialized = false
  characterController: RAPIER.KinematicCharacterController

  @RE.props.num() speed = 0.1
  characterCollider: RAPIER.Collider | undefined
  movementDirection = new THREE.Vector3(0.0, 0.0, 0.0)
  rigidBody: RAPIER.RigidBody

  @RE.props.select() type = 0;
  typeOptions = ["KinematicPositionBased", "KinematicVelocityBased"];

  //https://github.com/dimforge/rapier.js/blob/master/testbed3d/src/demos/characterController.ts
  awake() {
  }

  start() {

  }

  beforeUpdate(): void {
    if (!RogueRapier.initialized) return;
    !this.initialized && this.init();

    // this.type !== RAPIER.RigidBodyType.Fixed && 
    // this.updatePhysics();
    const component = RE.getComponent(RapierBody, this.object3d);
    if (!component) {
      RE.Debug.logError("did not find body")
    } else {
      this.rigidBody = component.body


      const colliderComponent = this.getColliderComponentFromAChild(this.object3d)
      if (colliderComponent) {
        this.characterCollider = colliderComponent[0].collider
      }

    }
  }

  getColliderComponentFromAChild(object3d) {
    const rapierColliders: RapierCollider[] = [];

    object3d.traverse(obj => {
      const components = RE.getObjectComponents(obj);

      components.forEach(comp => {
        if (comp instanceof RapierCollider) {
          rapierColliders.push(comp);
        }
      })
    })
    return rapierColliders
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
    
    if (!this.rigidBody) {
      RE.Debug.logWarning("No character body")
      return
    }

    if (!this.characterCollider) {
      RE.Debug.logWarning("No character collider")
      return
    }

    const gravity = -9.81
    const playerVelocity = new THREE.Vector3(0, 0, 0)

    const scaledMovement = new THREE.Vector3(this.movementDirection.x, 0, this.movementDirection.z)
    scaledMovement.normalize()
    // RE.Debug.log(`Moving ${JSON.stringify(this.movementDirection)}`)
    
    playerVelocity.x = scaledMovement.x * this.speed
    playerVelocity.z = scaledMovement.z * this.speed
    const nextPosition = this.rigidBody.translation()
    const isGrounded = this.characterController.computedGrounded()
   if(isGrounded) {
    RE.Debug.log(`grounded`)
   }
    if(isGrounded && playerVelocity.y != 0) {
      playerVelocity.y = 0
    }

    let fixedStep = RE.Runtime.deltaTime
    // RE.Debug.log(`${RE.Runtime.clock.getDelta()}`)
    if (isGrounded && this.movementDirection.y != 0) {
      RE.Debug.log("jumping")
      playerVelocity.y += Math.sqrt(
        this.jumpHeight * 3 * (gravity * (fixedStep)),
      )
    }

    playerVelocity.y += gravity * (fixedStep)

    // RE.Debug.log(`Moving ${JSON.stringify(playerVelocity)}`)

    this.characterController.computeColliderMovement(
      this.rigidBody.collider(0),
      playerVelocity,
    )

    const characterMovement = this.characterController.computedMovement()

    nextPosition.x += characterMovement.x
    nextPosition.y += characterMovement.y
    nextPosition.z += characterMovement.z

    this.rigidBody.setNextKinematicTranslation(nextPosition)

    

    // switch(this.type) {
    //   case 0:
    //     // let movement = this.characterController.computedMovement()
    //     // let newPos = this.character.translation()
    //     // newPos.x += movement.x
    //     // newPos.y += movement.y
    //     // newPos.z += movement.z
    //     // this.character.setNextKinematicTranslation(newPos)
    //     break;
    //   case 1:
    //     let velocity = new RAPIER.Vector3(scaledMovementDirection.x, scaledMovementDirection.y, scaledMovementDirection.z)
    //     this.character.setLinvel(velocity, true)
    //     break;
    // }
  }
}

RE.registerComponent(RapierKinematicCharacterController);
