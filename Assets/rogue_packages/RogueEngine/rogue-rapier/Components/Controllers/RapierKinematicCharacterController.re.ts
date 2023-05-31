import * as RE from 'rogue-engine'
import RogueRapier from '../../Lib/RogueRapier'
import * as RAPIER from '@dimforge/rapier3d-compat'
import RapierBody from '../RapierBody.re'
import RapierCollider from '../Colliders/RapierCollider'
import * as THREE from 'three'

export default class RapierKinematicCharacterController extends RE.Component {
  @RE.props.num() autostepMaxHeight = 0.7
  @RE.props.num() autostepMinWidth = 0.3
  @RE.props.checkbox() autostepIncludeDynamicBodies = true
  @RE.props.num() snapToGroundDistance = 0.7

  initialized = false
  characterController: RAPIER.KinematicCharacterController

  @RE.props.num() speed = 0.1
  characterCollider: RAPIER.Collider | undefined
  movementDirection = { x: 0.0, y: -this.speed, z: 0.0 }
  character: RAPIER.RigidBody

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
      this.character = component.body


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
    this.characterController = RogueRapier.world.createCharacterController(0.1)
    this.characterController.enableAutostep(this.autostepMaxHeight, this.autostepMinWidth, this.autostepIncludeDynamicBodies);
    this.characterController.enableSnapToGround(this.snapToGroundDistance);
  }

  update() {
    const scaledMovementDirection = new THREE.Vector3(this.movementDirection.x, this.movementDirection.y, this.movementDirection.z)
    scaledMovementDirection.multiplyScalar(this.speed)

    if (!this.character) {
      RE.Debug.logWarning("No character body")
      return
    }

    if (!this.characterCollider) {
      RE.Debug.logWarning("No character collider")
      return
    }

    scaledMovementDirection.setY(-this.speed)

    this.characterController.computeColliderMovement(
      this.characterCollider,
      scaledMovementDirection,
    )

    let movement = this.characterController.computedMovement()
    let newPos = this.character.translation()
    newPos.x += movement.x
    newPos.y += movement.y
    newPos.z += movement.z
    this.character.setNextKinematicTranslation(newPos)
  }
}

RE.registerComponent(RapierKinematicCharacterController);
