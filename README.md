# Rogue Rapier
*rogue-rapier*

This is a package for [Rogue Engine](https://rogueengine.io/). You should install it in your project from the Marketplace within the editor.

## Introduction

This package is an integration of the [Rapier Physics engine]() for Rogue Engine. It provides useful components to simulate physics in your projects.

A good starting point would be to watch this tutorial on how to make a flappy bird clone using this package.

[![FlappyRogue Tutorial](https://img.youtube.com/vi/PMmWT3Iuf5g/0.jpg)](https://www.youtube.com/watch?v=PMmWT3Iuf5g)

## Setup

- Install the rogue-rapier package in the Marketplace within the editor.
- Select your Scene object in the hierarchy and add the RapierConfig component.

## RapierBody

This component creates a [RAPIER.RigidBody](https://rapier.rs/docs/user_guides/javascript/rigid_bodies) for an object in your scene.

Add this component to an object in order to integrate it to the physics simulation.

From the `.body` property you have full access to the `RAPIER.RigidBody`. Use this to get access to all of the RAPIER features. Remember this is not a wrapper, but simply an adapter. So the API remains that of Rapier.

Use the provided event callbacks `onCollisionStart` and `onCollisionEnd` to handle collision events.

```ts
...
// You can detect collisions on the RapierBody in this.object3d...
@RapierBody.require() 
body: RapierBody;

// Or in any other object with a RapierBody
@RE.props.object()
otherObject: THREE.Object3D

start() {
  // Define the onCollisionStart event handler
  this.body.onCollisionStart = (info: RapierCollisionInfo) => {
    console.log("Collision started!");
    console.log("Own Collider:", info.ownCollider);
    console.log("Other Collider:", info.otherCollider);
    console.log("Other Body:", info.otherBody);
  };

  const otherBody = RapierBody.get(this.otherObject);

  // Define the onCollisionEnd event handler
  otherBody.onCollisionEnd = (info: RapierCollisionInfo) => {
    console.log("Collision ended!");
    console.log("Own Collider:", info.ownCollider);
    console.log("Other Collider:", info.otherCollider);
    console.log("Other Body:", info.otherBody);
  };
}
...
```

## Colliders

RogueRapier includes pre-made colliders you can add directly to your objects. All colider components extend `RapierCollider`. You can create your own custom colliders by extending this class, imitating the other available implementations.

**A RigidBody can have many clolliders. The collider component will attach itself to the rigidbody in the same object or a parent, recursively, all the way up to the root.**

Add one of the available collider components to an object in your scene, and adjust its offsets to increase or reduce its size.

The available collider components are, `RapierBall`, `RapierCapsule`, `RapierCone`, `RapierCuoid`, `RapierCylinder` and `RapierTrimesh`.

The `RapierTrimesh` is useful when you need the collider to fit precisely on a Mesh.

## Controllers

This package includes an implementation for the `RapierKinematicCharacterController` and 2 different especializations using it; `RapierThirdPersonController` and `RapierThirdPersonController`.

Feel free to dig into the code to see how the specializations are implemented in order to create your own if you feel like doing so.

It also includes a prefab for both of them: `FirstPersonCharacter.roguePrefab` and `ThirdPersonCharacter.roguePrefab`. Press `alt/opt+A` to access the `Asset Manager`, use the search box or scroll to find them and drop them in your scene.

Here's a tutorial on how to use them:

[![Thid Person Controller Tutorial](https://img.youtube.com/vi/OIorPLKWCv4/0.jpg)](https://www.youtube.com/watch?v=OIorPLKWCv4)

## Best Practices

When using simple shapes that easily fit a single collider, it's best to add the RapierBody and collider components directly on the same object.

When adapting to more complex shapes, or setting up a player character. It's best to use a more flexible structure.

- Group -> `RapierBody` or `RapierKinematicCharacterController`
 - Object3D -> `RapierCollider` (any of them)
 - Object3D -> `RapierCollider` (optional, add as many as you need)

**Note:** keep in mind that the position of a Dynamic RigidBody, will represent its center of mass. So in general, you'll want the object containing the `RapierBody` component to sit at the center of all colliders. But I repeat, this is only for a `RapierBody` set to Dynamic.

When creating colliders for the fixed objects of the environment, it's best to put all the colliders under the same `RapierBody`. This will greatly increase performance.

- Group -> `RapierBody` (fixed)
  - Mesh -> `RapierCuboid`
  - Group
    - Mesh
    - Object3D -> `RapierSphere`
    - Object3D -> `RapierCuboid`
  - Mesh -> `RapierTrimesh`

