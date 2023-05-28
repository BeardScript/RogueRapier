import RAPIER from '@dimforge/rapier3d-compat';

export default class RogueRapier {
  static world: RAPIER.World;
  static eventQueue: RAPIER.EventQueue;
  static initialized = false;

  static async init() {
    await RAPIER.init();
    this.world = new RAPIER.World({x: 0, y: -9.81, z: 0});
    this.eventQueue = new RAPIER.EventQueue(true);
    this.initialized = true;
  }
}
