import { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';
import { Entity } from 'prismarine-entity';
import { Block } from 'prismarine-block';
import { BlockPlacePredictionOverride } from './blockPlacePrediction';
export interface BlockInteractionHandler {
    test: (block: Block) => boolean;
    handle: (block: Block, bot: Bot) => void;
}
export interface ItemUseState {
    item: {
        name: string;
    };
    isOffhand: boolean;
    name: string;
}
export interface BotPluginSettings {
    /** @default true */
    warnings?: boolean;
    /** @default true */
    blockPlacePrediction?: boolean;
    /** @default 0 */
    blockPlacePredictionDelay?: number;
    /** @default true */
    blockPlacePredictionCheckEntities?: boolean;
    blockPlacePredictionHandler?: BlockPlacePredictionOverride;
    blockInteractionHandlers?: Record<string, BlockInteractionHandler>;
    noBreakPositiveUpdate?: boolean;
    /** @default true */
    preventVehicleInteraction?: boolean;
    /** @default true */
    useMineflayerInteractMethods?: boolean;
    /**
     * When true, allow starting a break while not on ground (mid-air).
     * Swimming in water without ground contact is always allowed without this flag.
     * @default false
     */
    allowInAirMining?: boolean;
}
export interface CursorState {
    cursorBlock: Block | null;
    cursorBlockDiggable: Block | null;
    cursorChanged: boolean;
    /** True when block position changed (not just stateId); used to avoid spurious stops from server sync */
    cursorPositionChanged: boolean;
    entity: Entity | null;
}
export declare class MouseManager {
    private bot;
    settings: BotPluginSettings;
    /** stateId - seconds */
    customBreakTime: Record<string, number>;
    customBreakTimeToolAllowance: Set<string>;
    buttons: [boolean, boolean, boolean];
    lastButtons: [boolean, boolean, boolean];
    cursorBlock: Block | null;
    tick: number;
    private entityRaycastCache;
    prevBreakState: number | null;
    currentDigTime: number | null;
    prevOnGround: boolean | null;
    rightClickDelay: number;
    breakStartTime: number | undefined;
    ended: boolean;
    lastDugBlock: Vec3 | null;
    lastDugTime: number;
    /** a visually synced one */
    currentBreakBlock: {
        block: Block;
        stage: number;
    } | null;
    debugDigStatus: string;
    debugLastStopReason: string;
    brokenBlocks: Block[];
    lastSwing: number;
    itemBeingUsed: ItemUseState | null;
    swingTimeout: any;
    private blockHandlers;
    originalDigTime: (block: Block) => number;
    constructor(bot: Bot, settings?: BotPluginSettings);
    resetDiggingVisual(block: Block): void;
    stopDiggingCompletely(reason: string, tempStopping?: boolean): void;
    private initBotEvents;
    activateEntity(entity: Entity): void;
    beforeUpdateChecks(): void;
    update(): void;
    getCursorState(): CursorState;
    private getCachedRaycastEntity;
    placeBlock(cursorBlock: Block, direction: Vec3, delta: Vec3, offhand: boolean, forceLook?: 'ignore' | 'lookAt' | 'lookAtForce', doClientSwing?: boolean): Promise<void>;
    private updatePlaceInteract;
    getCustomBreakTime(block: Block): number | undefined;
    digTime(block: Block): number;
    private startUsingItem;
    private stopUsingItem;
    private updateBreaking;
    private updateBreakingBlockState;
    private maybeStartBreaking;
    setConfigFromPacket(packet: any): void;
    private startBreaking;
    private updateButtonStates;
    getDataFromShape(shape: [number, number, number, number, number, number]): {
        position: Vec3;
        width: number;
        height: number;
        depth: number;
    };
    getBlockCursorShapes(block: Block): [number, number, number, number, number, number][];
    getMergedCursorShape(block: Block): [number, number, number, number, number, number] | undefined;
}
export declare const versionToNumber: (ver: string) => number;
export declare function inject(bot: Bot, settings: BotPluginSettings): MouseManager;
declare module 'mineflayer' {
    interface Bot {
        mouse: MouseManager;
        rightClickStart: () => void;
        rightClickEnd: () => void;
        leftClickStart: () => void;
        leftClickEnd: () => void;
        leftClick: () => void;
        rightClick: () => void;
        readonly usingItem: ItemUseState | null;
    }
    interface BotEvents {
        'botArmSwingStart': (hand: 'right' | 'left') => void;
        'botArmSwingEnd': (hand: 'right' | 'left') => void;
        'blockBreakProgressStage': (block: Block, stage: number | null) => void;
        'startDigging': (block: Block) => void;
        'goingToSleep': (block: Block) => void;
        'startUsingItem': (item: {
            name: string;
        }, slot: number, isOffhand: boolean, duration: number) => void;
        'stopUsingItem': (item: {
            name: string;
        }, slot: number, isOffhand: boolean) => void;
        'highlightCursorBlock': (data?: {
            block: Block;
        }) => void;
        'mouseBlockPlaced': (block: Block, direction: Vec3, delta: Vec3, offhand: boolean, wasPredicted: boolean) => void;
    }
}
export { MouseManager as MousePlugin };
