import type VisualComponent from "./VisualComponent.re";
export type valueTypes = "Vector3" | "Number" | "String" | "Boolean" | "Object3D" | "Audio" | "Component" | "Prefab" | "Array" | "Params" | "Any" | "Expression" | "Field" | "BlockParam" | "Method" | "Undefined";
export type RogueValue = {
    type: valueTypes;
    valueType?: ValueType;
    params?: (RogueValue | RogueActionType)[];
    value: any;
};
export type ValueType = {
    type: valueTypes;
    valueType?: string;
};
export type ReturnValueType = {
    type: valueTypes;
    valueType?: string | ValueType;
};
type RogueBrickConfig = {
    name: string;
    description?: string;
    params?: RogueBrickParam[];
};
type RogueBrickParam = {
    type: valueTypes;
    valueType?: ValueType | string;
    name: string;
    value?: any;
    optional?: boolean;
    options?: (brick: RogueBrick, vc: typeof VisualComponent) => any[];
    infer?: (brick: RogueBrick, vc: typeof VisualComponent) => ReturnValueType;
    slots?: (brick: RogueBrick, vc: typeof VisualComponent) => any[];
};
type RogueBrickReturn = {
    type: valueTypes;
    valueType?: ValueType | string;
    name: string;
    infer?: (brick: RogueBrick, vc: typeof VisualComponent) => ReturnValueType;
};
export type RogueActionConfig = RogueBrickConfig & {
    type: "Action";
    returns?: RogueBrickReturn[];
    do: (args: {
        component: VisualComponent;
        brick: RogueActionType;
    }, ...params: any[]) => any;
};
export type RogueBlockConfig = RogueBrickConfig & {
    type: "Block";
    blockParams?: RogueBrickReturn[];
    do: (args: {
        component: VisualComponent;
        brick: RogueBlockType;
    }, ...params: any[]) => any;
};
export type RogueEventConfig = RogueBrickConfig & {
    type: "Event";
    blockParams?: RogueBrickReturn[];
    do: (args: {
        component: VisualComponent;
        brick: RogueEventType;
    }, ...params: any[]) => any;
};
export type RogueConditionConfig = RogueBrickConfig & {
    type: "Condition";
    do: (args: {
        component: VisualComponent;
        brick: RogueConditionType;
    }, ...params: any[]) => any;
};
export type BrickConfig = RogueActionConfig | RogueBlockConfig | RogueEventConfig | RogueConditionConfig;
type BaseRogueBrick = {
    id?: string;
    name: string;
    params?: (RogueValue | RogueActionType)[];
};
export type RogueActionType = BaseRogueBrick & {
    type: "Action";
    returns?: {
        type: valueTypes;
        valueType?: ValueType | string;
        name: string;
    }[];
};
export type RogueBlockType = BaseRogueBrick & {
    type: "Block";
    blockParams?: {
        type: valueTypes;
        name: string;
    }[];
    block: RogueBrick[];
};
export type RogueEventType = BaseRogueBrick & {
    type: "Event";
    blockParams?: {
        type: valueTypes;
        name: string;
    }[];
    block: RogueBrick[];
};
export type RogueConditionType = BaseRogueBrick & {
    type: "Condition";
    block: RogueBrick[];
    elseif?: {
        name: "RE:IF";
        block: RogueBrick[];
        params?: (RogueValue | RogueActionType)[];
    }[];
    else?: RogueBrick[];
};
export type RogueBrick = RogueActionType | RogueEventType | RogueBlockType | RogueConditionType;
export type VisualComponentData = {
    fields?: any[];
    awake?: RogueBrick[];
    start?: RogueBrick[];
    update?: RogueBrick[];
    methods?: Record<string, {
        type: "Function";
        blockParams: (RogueValue | RogueActionType)[];
        block: RogueBrick[];
        return?: {
            type: valueTypes;
            valueType?: ValueType | string;
        };
    }>;
};
export {};
