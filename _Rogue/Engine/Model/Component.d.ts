import Lifecycle from './Lifecycle';
import { Object3D } from 'three';
export default class Component extends Lifecycle {
    private _name;
    private _object3d;
    private _isReady;
    private _enabled;
    uuid: string;
    interface: ComponentInterface;
    constructor(name: string, object3d: Object3D);
    static get<T>(this: {
        new (...args: any[]): T;
    }): T;
    static get<T>(this: {
        new (...args: any[]): T;
    }, object3d: Object3D): T;
    static get<T>(this: {
        new (...args: any[]): T;
    }, object3d: Object3D, inAncestor?: boolean): T;
    static get<T>(this: {
        new (...args: any[]): T;
    }, name: string, object3d?: Object3D): T;
    static get<T>(this: {
        new (...args: any[]): T;
    }, name: string, object3d: Object3D, inAncestor?: boolean): T;
    static require(inAncestor?: boolean): any;
    static require(name: string, inAncestor?: boolean): any;
    /**
     * The name by which to search a component.
     *
     * For best results, make sure you don't
     * repeat them within the same Object3D.
    */
    get name(): string;
    set name(newName: string);
    /**
     * Reference to the Object3D asociated to this component.
     *
     * Caution!! It can only be set internally by the engine
     */
    get object3d(): Object3D;
    /**
     * The 'ready' status of the component. This property will
     * be true once all the assets referenced in the 'interface'
     * of this component are loaded.
     */
    get isReady(): boolean;
    get enabled(): boolean;
    set enabled(value: boolean);
    toJSON(): {
        name: string;
        componentPrototypeName: string;
        interface: ComponentInterface;
        interfaceRefs: {
            [propName: string]: any;
        };
    };
    fromJSON(json: any): void;
    private serializePropRef;
    private serializeInterfaceRefs;
    private loadInterfaceRefs;
    private readyNotifier;
    private loadPropRef;
    awake(): void;
    start(): void;
    beforeUpdate(): void;
    update(): void;
    afterUpdate(): void;
    onBeforeRemoved(): void;
    onRemoved(): void;
    onBeforeObjectRemoved(): void;
    onObjectRemoved(): void;
    onDisabled(): void;
}
type ComponentInterfaceType = 'String' | 'Number' | 'Boolean' | 'Select' | 'Vector2' | 'Vector3' | 'Object3D' | 'Prefab' | 'Texture' | 'Material' | 'Component' | 'Audio' | 'Color' | 'PositionalAudio' | 'AnimationClip' | 'Button' | 'Data' | 'Code';
export type ComponentInterface = {
    [propName: string]: ComponentInterfaceType | {
        type: ComponentInterfaceType;
        isMap?: boolean;
        options?: any;
    };
};
export {};
