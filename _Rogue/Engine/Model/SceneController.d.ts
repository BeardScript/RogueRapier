import { WebGLRenderer, Scene, Object3D, Camera, Clock } from 'three';
import * as THREE from 'three';
import Lifecycle from './Lifecycle';
import type Component from '../Model/Component';
export default abstract class SceneController extends Lifecycle {
    renderFunc: () => void;
    domRect: DOMRect;
    resolution?: number;
    aspectRatio?: number;
    useAspectRatio: boolean;
    private _clock;
    private _onPlayCallbacks;
    private _onStopCallbacks;
    private _throttledAdjustCameraAndRenderer;
    protected _scene: THREE.Scene;
    protected _containerId: string;
    protected _rogueDOMContainer: HTMLElement;
    protected _camera: Camera;
    protected _renderer: WebGLRenderer;
    protected _isRunning: boolean;
    protected _isPaused: boolean;
    protected _width: number;
    protected _height: number;
    protected _isOffscreen: boolean;
    protected _request: number;
    protected _stop: () => void;
    private _deltaTime;
    private _pageVisibilityHandler;
    constructor();
    get defaultRenderFunc(): () => void;
    get deltaTime(): number;
    get height(): number;
    get width(): number;
    get containerId(): string;
    get camera(): Camera;
    set camera(value: Camera);
    get scene(): Scene;
    get renderer(): WebGLRenderer;
    get isRunning(): boolean;
    get isPaused(): boolean;
    get rogueDOMContainer(): HTMLElement;
    get clock(): Clock;
    onPlay(callback: () => any): {
        stop: () => void;
    };
    onStop(callback: () => any): {
        stop: () => void;
    };
    private loadMaterials;
    play(scene: Scene, renderer?: WebGLRenderer, componentsToLoad?: any): void;
    stop(): void;
    private updateEventsHandler;
    pause(): void;
    resume(): void;
    togglePause(): void;
    protected traverseObject3d(object: Object3D, callback: (object3d: Object3D) => void): void;
    protected abstract traverseSceneComponents(callback: (component: Component) => void): void;
    protected awake(): void;
    protected start(): void;
    protected beforeUpdate(): void;
    protected update(): void;
    protected afterUpdate(): void;
    startRenderer(renderer?: WebGLRenderer): void;
    setFullscreen(): void;
    protected doOnResize: (entries: any) => void;
    onResize: () => void;
    resizeObserver: ResizeObserver;
    setSceneDimensions(width: number, height: number): void;
    private setCameraDimensions;
    protected adjustCameraAndRenderer(force?: boolean): void;
    scaleResolution(): void;
    setAspectRatio(): void;
    protected beginUpdateCycle(): void;
}
