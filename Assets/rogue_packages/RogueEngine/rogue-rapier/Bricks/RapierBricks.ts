import RAPIER from "@dimforge/rapier3d-compat";
import RapierBody from "@RE/RogueEngine/rogue-rapier/Components/RapierBody.re";
import * as THREE from "three";
import * as RE from "rogue-engine";
import RapierCollider from "@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierCollider";

const dummy = new THREE.Object3D();
let v1 = new THREE.Vector3();
let v2 = new THREE.Vector3();
let v3 = new THREE.Vector3();
let v4 = new THREE.Vector3();

let getV3 = () => {
  return {
    x: {type: "Number", value: 0}, 
    y: {type: "Number", value: 0}, 
    z: {type: "Number", value: 0}
  }
}

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:SetLinearVelocity",
  description: "Sets the linear velocity of a RapierBody",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"},
    {type: "Vector3", name: "vector", value: getV3()}
  ],
  do(args, body: RapierBody, vector: RAPIER.Vector3) {
    body.body.setLinvel(vector, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:GetLinearVelocity",
  description: "Gets the linear velocity of a RapierBody",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"},
  ],
  returns: [{type: "Vector3", name: "linVel"}],
  do(args, body: RapierBody) {
    const vel = body.body.linvel();
    return new THREE.Vector3(vel.x, vel.y, vel.z);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:SetAngularVelocity",
  description: "Sets the angular velocity of a RapierBody",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"},
    {type: "Vector3", name: "vector", value: getV3()}
  ],
  do(args, body: RapierBody, vector: RAPIER.Vector3) {
    body.body.setAngvel(vector, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:GetAngularVelocity",
  description: "Gets the angular velocity of a RapierBody",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"},
  ],
  returns: [{type: "Vector3", name: "angVel"}],
  do(args, body: RapierBody) {
    const vel = body.body.angvel();
    return new THREE.Vector3(vel.x, vel.y, vel.z);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:SetPosition",
  description: "Sets the position of a RapierBody",
  params: [{type: "Component", valueType: "RapierBody", name: "body"}, {type: "Vector3", name: "position", value: getV3()}],
  do(args, body: RapierBody, position: THREE.Vector3) {
    body.object3d.position.copy(position);
    body?.body?.setTranslation(position, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:SetObjectPosition",
  description: "Sets the position of an Object3D with a RapierBody",
  params: [{type: "Object3D", name: "object"}, {type: "Vector3", name: "position", value: getV3()}],
  do(args, object3d: THREE.Object3D, position: THREE.Vector3) {
    const body = RE.getComponent(RapierBody, object3d);
    body?.body?.setTranslation(position, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:Move",
  description: "Moves a RapierBody in the given direction at the given speed.",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"}, 
    {type: "Vector3", name: "direction", value: getV3()}, 
    {type: "Number", name: "speed", value: 0}
  ],
  do(args, body: RapierBody, direction: THREE.Vector3, speed: number) {
    body.body.setLinvel(direction.normalize().multiplyScalar(-speed), true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:MoveX",
  description: "Moves a RapierBody in the given direction at the given speed.",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"}, 
    {type: "Number", name: "speed", value: 1}
  ],
  do(args, body: RapierBody, speed: number) {
    const curLinvel = body.body.linvel();
    body.body.setLinvel({x: speed, y: curLinvel.y, z: curLinvel.z}, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:MoveY",
  description: "Moves a RapierBody in the given direction at the given speed.",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"}, 
    {type: "Number", name: "speed", value: 1}
  ],
  do(args, body: RapierBody, speed: number) {
    const curLinvel = body.body.linvel();
    body.body.setLinvel({x: curLinvel.x, y: speed, z: curLinvel.z}, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:MoveZ",
  description: "Moves a RapierBody in the given direction at the given speed.",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"}, 
    {type: "Number", name: "speed", value: 1}
  ],
  do(args, body: RapierBody, speed: number) {
    const curLinvel = body.body.linvel();
    body.body.setLinvel({x: curLinvel.x, y: curLinvel.y, z: -speed}, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:RotateTowards",
  description: "Smoothly makes a RapierBody face a target Object3D",
  params: [{type: "Component", valueType: "RapierBody", name: "body"}, {type: "Object3D", name: "target"}, {type: "Number", name: "smooth step", value: 1}],
  do(args, body: RapierBody, target: THREE.Object3D, speed: number) {
    body.object3d.quaternion.rotateTowards(target.quaternion, speed);
    body.body.setRotation(body.object3d.quaternion, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:LookAtDirection",
  description: "Smoothly makes a RapierBody face a given direction",
  params: [
    {type: "Component", valueType: "RapierBody", name: "body"}, 
    {type: "Vector3", name: "direction", value: getV3()}, 
    {type: "Number", name: "smooth step", value: 1}
  ],
  do(args, body: RapierBody, direction: THREE.Vector3, speed: number) {
    v2.copy(direction); direction = v2;
    if (direction.length() === 0) return;
    direction.normalize();

    body.object3d.getWorldPosition(dummy.position);
    v1.copy(dummy.position).sub(direction);
    dummy.lookAt(v1);

    body.object3d.quaternion.rotateTowards(dummy.quaternion, speed);
    body.body.setRotation(body.object3d.quaternion, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:ApplyImpulse",
  description: "Applies an impulse in a given direction to a RapierBody",
  params: [{type: "Component", valueType: "RapierBody", name: "body"}, {type: "Vector3", name: "vector", value: getV3()}],
  do(args, body: RapierBody, vector: RAPIER.Vector3) {
    body.body.applyImpulse(vector, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:ApplyDryImpulse",
  description: "Applies an impulse with no momentum in a given direction to a RapierBody",
  params: [{type: "Component", valueType: "RapierBody", name: "body"}, {type: "Vector3", name: "vector", value: getV3()}],
  do(args, body: RapierBody, vector: RAPIER.Vector3) {
    body?.body?.setLinvel({x:0, y:0, z:0}, true);
    body?.body?.applyImpulse(vector, true);
  }
});

RE.VisualComponent.defineAction({
  type: "Action",
  name: "Rapier:ColliderIsSensor",
  description: "Is the given collider a sensor?",
  params: [{type: "Component", valueType: "RapierCollider", name: "collider"}],
  returns: [{type: "Boolean", name: "isSensor"}],
  do(args, collider: RapierCollider) {
    return collider.collider.isSensor();
  }
});

RE.VisualComponent.defineEvent({
  type: "Event",
  name: "Rapier:OnCollisionStart",
  description: "Define what happens the moment when an object collides",
  params: [{type: "Object3D", name: "object"}],
  blockParams: [
    {type: "Object3D", name: "other"},
    {type: "Component", valueType: "RapierBody", name: "otherBody"},
    {type: "Component", valueType: "RapierCollider", name: "otherCollider"},
    {type: "Component", valueType: "RapierCollider", name: "ownCollider"},
  ],
  do(args, object3d?: THREE.Object3D) {
    const body = RE.getComponent(RapierBody, object3d || args.component.object3d);
    body.onCollisionStart = (info) => {
      
      args.component.setBlockParam(args.brick, "other", info.otherBody.object3d);
      args.component.setBlockParam(args.brick, "otherBody", info.otherBody);
      args.component.setBlockParam(args.brick, "otherCollider", RapierCollider.findByShape(info.otherCollider));
      args.component.setBlockParam(args.brick, "ownCollider", RapierCollider.findByShape(info.ownCollider));

      if (args.brick.block) {
        args.component.callBlock(args.brick.block);
      }
    }
  }
});

RE.VisualComponent.defineEvent({
  type: "Event",
  name: "Rapier:OnCollisionEnd",
  description: "Define what happens the moment when an object stops colliding",
  params: [{type: "Object3D", name: "object"}],
  blockParams: [
    {type: "Object3D", name: "other"},
    {type: "Component", valueType: "RapierBody", name: "otherBody"},
    {type: "Component", valueType: "RapierCollider", name: "otherCollider"},
    {type: "Component", valueType: "RapierCollider", name: "ownCollider"},
  ],
  do(args, object3d?: THREE.Object3D) {
    const body = RE.getComponent(RapierBody, object3d || args.component.object3d);
    body.onCollisionEnd = (info) => {
      
      args.component.setBlockParam(args.brick, "other", info.otherBody.object3d);
      args.component.setBlockParam(args.brick, "otherBody", info.otherBody);
      args.component.setBlockParam(args.brick, "otherCollider", RapierCollider.findByShape(info.otherCollider));
      args.component.setBlockParam(args.brick, "ownCollider", RapierCollider.findByShape(info.ownCollider));

      if (args.brick.block) {
        args.component.callBlock(args.brick.block);
      }
    }
  }
});
