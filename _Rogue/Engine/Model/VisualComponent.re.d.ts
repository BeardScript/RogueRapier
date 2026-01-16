import Component from './Component';
import type { VisualComponentData, BrickConfig, RogueActionConfig, RogueBlockConfig, RogueEventConfig, RogueConditionConfig, RogueBrick, RogueValue, RogueBlockType, RogueEventType, valueTypes } from './VisualComponentTypes';
export declare class BlockReturn {
    value?: any;
    constructor(value?: any);
}
export default class VisualComponent extends Component {
    static primitiveValueTypes: string[];
    static threeValueTypes: string[];
    static rogueValueTypes: string[];
    static valueTypes: string[];
    static data: VisualComponentData;
    static actions: Record<string, BrickConfig>;
    static selectedVC: typeof VisualComponent;
    blockParams: Record<string, any>;
    static errors: Record<string, string>;
    static defineAction(action: RogueActionConfig): void;
    static defineBlock(action: RogueBlockConfig): void;
    static defineEvent(action: RogueEventConfig): void;
    static defineCondition(action: RogueConditionConfig): void;
    static vcRequire(type: string, inAncestor?: boolean): any;
    static vcRequire(type: string, name: string, inAncestor?: boolean): any;
    static BlockReturn: typeof BlockReturn;
    static getParamType(paramIndex: number, brick: RogueBrick, vc: typeof VisualComponent): any;
    awake(): void;
    start(): void;
    update(): void;
    parseBrick(event: RogueBrick): any;
    parseValue(elem: RogueValue | RogueBrick): any;
    parseParams(params: {
        type: valueTypes;
        name?: string;
        value: any;
    }[]): any[];
    callMethod: (name: string, ...args: any[]) => any;
    callAction(action: RogueBrick): any;
    callEvent(action: RogueBrick): any;
    callBlock(block: RogueBrick[]): any;
    setBlockParam(brick: RogueBlockType | RogueEventType, param: string, value: any): void;
}
