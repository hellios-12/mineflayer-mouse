import { Bot } from 'mineflayer';
import { Block } from 'prismarine-block';
import { Vec3 } from 'vec3';
import { Shape } from 'prismarine-world/types/iterators';
export declare const directionToVector: Vec3[];
export type BlockPlacePredictionOverride = (computedBlock: Block) => Block | null | undefined;
export declare const botTryPlaceBlockPrediction: (bot: Bot, cursorBlock: Block, faceNum: number, delta: Vec3, doWorldUpdate: boolean, doWorldUpdateDelay: number, override: BlockPlacePredictionOverride | null, checkEntities: boolean) => boolean;
export declare const isBlockIntersectsWithEntities: (entities: Bot["entities"], position: Vec3, blockShapes: Shape[]) => false | import("prismarine-entity").Entity;
