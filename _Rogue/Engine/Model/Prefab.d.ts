import * as THREE from 'three';
export declare class Prefab {
    private _uuid;
    constructor(uuid: string);
    get uuid(): string;
    get path(): string;
    get name(): string;
    static namedPrefabUUIDs: Record<string, string>;
    static instantiate(name: string): Promise<THREE.Object3D<THREE.Object3DEventMap>>;
    static fetch(name: string): Promise<Prefab>;
    static get(name: string): Prefab;
    instantiate(parent?: THREE.Object3D): THREE.Object3D<THREE.Object3DEventMap>;
}
