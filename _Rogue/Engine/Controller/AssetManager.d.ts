import { Object3D, Material, Texture, AnimationClip } from 'three';
import { AudioAsset } from '../Model/AudioAsset';
import type SceneController from '../Model/SceneController';
type AssetConfig = {
    preload?: boolean;
    keepLoaded?: boolean;
    override?: boolean;
};
declare class AssetManagerClass {
    private _assets;
    private _assetConfigs;
    private _assetPaths;
    private _loadingAssets;
    private _objectLoader;
    sceneController: SceneController;
    get assets(): {
        [uuid: string]: AnimationClip | Object3D<import("three").Object3DEventMap> | Texture | Material | AudioAsset;
    };
    get assetConfigs(): {
        [uuid: string]: AssetConfig;
    };
    get assetPaths(): {
        [uuid: string]: string;
    };
    get totalLoadingAssets(): number;
    onRegisterAsset(callback: (asset: Object3D | AudioAsset | Material | Texture | AnimationClip) => void): {
        stop: () => void;
    };
    onRemoveAsset(callback: (asset: Object3D | AudioAsset | Material | Texture | AnimationClip) => void): {
        stop: () => void;
    };
    onClearAssets(callback: () => void): {
        stop: () => void;
    };
    onSetAssetConfig(callback: (uuid: string, config: AssetConfig) => void): {
        stop: () => void;
    };
    onRemoveAssetConfig(callback: (uuid: string, config: AssetConfig) => void): {
        stop: () => void;
    };
    onLoadAssetConfigs(callback: (uuid: string, config: AssetConfig) => void): {
        stop: () => void;
    };
    onSetAssetPath(callback: (uuid: string, assetPath: string) => void): {
        stop: () => void;
    };
    onSetAssetPaths(callback: (paths: {
        [uuid: string]: string;
    }) => void): {
        stop: () => void;
    };
    onRemoveAssetPath(callback: (uuid: string, assetPath: string) => void): {
        stop: () => void;
    };
    setAssetConfig(uuid: string, config: {
        preload?: boolean;
        keepLoaded?: boolean;
        override?: boolean;
    }): void;
    getAssetConfig(uuid: string): AssetConfig;
    removeAssetConfig(uuid: string): void;
    setAssetPath(uuid: string, assetPath: string): void;
    removeAssetPath(uuid: string): void;
    setAssetPaths(paths: {
        [uuid: string]: string;
    }): void;
    getAssetPath(uuid: string): string | undefined;
    registerAsset(asset: Object3D | AudioAsset | Material | Texture | AnimationClip): void;
    loadAsset(uuid: string): Promise<AnimationClip | Object3D<import("three").Object3DEventMap> | Texture | Material | AudioAsset | undefined>;
    private getExtension;
    getAsset(uuid: string): AnimationClip | Object3D<import("three").Object3DEventMap> | Texture | Material | AudioAsset;
    loadObject(assetPath: string): Promise<Object3D>;
    private loadObjectFunction;
    private loadNestedPrefabs;
    private loadAudio;
    private loadAudioFunction;
    private loadAnimation;
    private loadAnimationFunction;
    loadMaterial(assetPath: string): Promise<Material>;
    private loadMaterialFunction;
    private loadTexture;
    private loadTextureFunction;
    private textureLoader;
    private loadTextureFile;
    private addLoadingAsset;
    private removeLoadingAsset;
    removeAsset(uuid: string): void;
    clear(): void;
    assetIsOrphan(uuid: string): boolean;
    loadAssetConfigs(configs?: {
        [uuid: string]: AssetConfig;
    }): void;
    /**
    * Load all assets set to preload if not loaded already
    */
    preloadAssets(): Promise<void>;
}
export declare let AssetManager: AssetManagerClass;
export {};
