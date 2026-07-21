"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlockIntersectsWithEntities = exports.botTryPlaceBlockPrediction = exports.directionToVector = void 0;
const itemBlocksStatic_1 = require("./itemBlocksStatic");
const prismarine_block_1 = __importDefault(require("prismarine-block"));
const vec3_1 = require("vec3");
const minecraft_data_1 = __importDefault(require("minecraft-data"));
exports.directionToVector = [new vec3_1.Vec3(0, -1, 0), new vec3_1.Vec3(0, 1, 0), new vec3_1.Vec3(0, 0, -1), new vec3_1.Vec3(0, 0, 1), new vec3_1.Vec3(-1, 0, 0), new vec3_1.Vec3(1, 0, 0)];
const directionToAxis = ['y', 'y', 'z', 'z', 'x', 'x'];
const directionToFacing = ['south', 'west', 'north', 'east', 'up', 'down'];
const botTryPlaceBlockPrediction = (bot, cursorBlock, faceNum, delta, doWorldUpdate, doWorldUpdateDelay, override, checkEntities) => {
    if (!bot.heldItem)
        return false;
    const isSneaking = bot.controlState.sneak;
    const adventurePlaceAllowed = bot.heldItem.blocksCanPlaceOn?.some(([blockName]) => blockName === cursorBlock.name) ?? false;
    const isBlockPlaceAction = bot.game.gameMode === 'adventure' ? adventurePlaceAllowed : (isSneaking ||
        // not interact action
        itemBlocksStatic_1.activatableBlockWithoutItemPatterns.every(pattern => !pattern.test(cursorBlock.name)));
    if (!isBlockPlaceAction)
        return false;
    const referencePosition = cursorBlock.position.clone();
    const oldBlock = bot.world.getBlock(referencePosition);
    const blockIsEmpty = oldBlock?.shapes.length === 0; // grass
    const directionVector = blockIsEmpty ? new vec3_1.Vec3(0, 0, 0) : exports.directionToVector[faceNum];
    const placingPosition = referencePosition.plus(directionVector);
    const mcData = (0, minecraft_data_1.default)(bot.version);
    const itemName = bot.heldItem.name;
    const block = mcData.blocksByName[itemBlocksStatic_1.itemToBlockRemaps[itemName] ?? itemName];
    if (block) {
        const cursorY = delta.y;
        let half = cursorY > 0.5 ? 'top' : 'bottom';
        if (faceNum === 0)
            half = 'top';
        else if (faceNum === 1)
            half = 'bottom';
        const axis = directionToAxis[faceNum];
        const facing = directionToFacing[faceNum];
        const prismarineBlock = (0, prismarine_block_1.default)(bot.version).fromStateId(block.defaultState, 0);
        let finalBlock = getBlockFromProperties((0, prismarine_block_1.default)(bot.version), prismarineBlock, block, [
            {
                // like slabs
                matchingState: 'type',
                requireValues: ['bottom', 'top', 'double'],
                // todo support double
                value: half
            },
            {
                // like stairs
                matchingState: 'axis',
                requireValues: ['x', 'y', 'z'],
                value: axis
            },
            {
                // like fences, signs
                matchingState: 'facing',
                requireValues: ['north', 'south', 'east', 'west', 'up', 'down'],
                value: facing
            },
        ]);
        finalBlock.position = placingPosition;
        if (override) {
            const overriddenBlock = override(finalBlock);
            if (overriddenBlock === null) {
                // block placement cancelled
                return false;
            }
            else if (overriddenBlock) {
                finalBlock = overriddenBlock;
            }
        }
        const isIntersectsWithEntities = checkEntities ? (0, exports.isBlockIntersectsWithEntities)(bot.entities, placingPosition, finalBlock.shapes) : false;
        if (isIntersectsWithEntities) {
            // console.log('Intersecting with entity', isIntersectsWithEntities.name)
            return false;
        }
        if (doWorldUpdate) {
            const doUpdate = () => {
                bot.world.setBlockStateId(placingPosition, finalBlock.stateId);
            };
            if (doWorldUpdateDelay) {
                let timeout = setTimeout(doUpdate, doWorldUpdateDelay);
                bot.on('end', () => {
                    clearTimeout(timeout);
                });
                bot.on('blockUpdate', (_, newBlock) => {
                    if (newBlock.position.equals(placingPosition)) {
                        clearTimeout(timeout);
                    }
                });
            }
            else {
                // Speculative placement applied immediately with no delay to cancel on.
                // Still needs reconciliation: if the server never confirms this placement
                // (denied by protection/plugin, out of reach, cooldown, etc.) the local
                // world permanently diverges from the server's, which can desync anything
                // that trusts local block data for correctness (e.g. the mesher's
                // occlusion/cave-culling graph, which computes section visibility purely
                // from local blocks and can end up treating an unconfirmed cell as open).
                const previousStateId = oldBlock?.stateId;
                doUpdate();
                let confirmed = false;
                let revertTimeout;
                const cleanup = () => {
                    clearTimeout(revertTimeout);
                    bot.removeListener('blockUpdate', onConfirm);
                    bot.removeListener('end', cleanup);
                };
                const onConfirm = (_, newBlock) => {
                    if (newBlock.position.equals(placingPosition)) {
                        confirmed = true;
                        cleanup();
                    }
                };
                revertTimeout = setTimeout(() => {
                    cleanup();
                    if (confirmed)
                        return;
                    // Server never confirmed this placement — revert to the pre-prediction
                    // state so the local world (and the mesher fed by it) doesn't keep a
                    // block that doesn't actually exist server-side.
                    const currentBlock = bot.world.getBlock(placingPosition);
                    if (currentBlock?.stateId === finalBlock.stateId) {
                        bot.world.setBlockStateId(placingPosition, previousStateId ?? 0);
                    }
                }, 1000);
                bot.on('blockUpdate', onConfirm);
                bot.on('end', cleanup);
            }
        }
        return true;
    }
    // Held item doesn't map to any real block (e.g. iron ingot, tools, food, empty hand
    // reaching this point via sneak) - nothing was actually placed, so this must NOT be
    // reported as a successful prediction. Previously this fell through to `return true`
    // unconditionally, which caused a spurious 'mouseBlockPlaced' event on plain right-click
    // interactions (Stone, Crafting Table, etc.) even though setBlockStateId was never called.
    return false;
};
exports.botTryPlaceBlockPrediction = botTryPlaceBlockPrediction;
const isBlockIntersectsWithEntities = (entities, position, blockShapes) => {
    for (const entity of Object.values(entities)) {
        const w = entity.width / 2;
        const entityShapes = [[-w, 0, -w, w, entity.height, w]];
        // Check each entity shape against each block shape for intersection
        for (const entityShape of entityShapes) {
            // Translate entity shape to entity position
            const translatedEntityShape = [
                entityShape[0] + entity.position.x,
                entityShape[1] + entity.position.y,
                entityShape[2] + entity.position.z,
                entityShape[3] + entity.position.x,
                entityShape[4] + entity.position.y,
                entityShape[5] + entity.position.z
            ];
            for (const blockShape of blockShapes) {
                // Translate block shape to target position
                const translatedBlockShape = [
                    blockShape[0] + position.x,
                    blockShape[1] + position.y,
                    blockShape[2] + position.z,
                    blockShape[3] + position.x,
                    blockShape[4] + position.y,
                    blockShape[5] + position.z
                ];
                // Check if boxes intersect
                if (boxesIntersect(translatedEntityShape, translatedBlockShape)) {
                    return entity;
                }
            }
        }
    }
    return false;
};
exports.isBlockIntersectsWithEntities = isBlockIntersectsWithEntities;
// Helper function to check if two boxes intersect
const boxesIntersect = (box1, box2) => {
    return (box1[0] <= box2[3] && box1[3] >= box2[0]) && // X axis overlap
        (box1[1] <= box2[4] && box1[4] >= box2[1]) && // Y axis overlap
        (box1[2] <= box2[5] && box1[5] >= box2[2]); // Z axis overlap
};
const getBlockFromProperties = (prismarineBlockInstance, prismarineBlock, blockData, properties) => {
    const states = blockData.states;
    if (!states)
        return prismarineBlock;
    const defaultProps = prismarineBlock.getProperties();
    const finalProps = {};
    for (const prop of states) {
        const propName = prop.name;
        const propValue = properties.find(p => {
            if (p.matchingState !== propName)
                return false;
            if (p.requireValues) {
                if (!p.requireValues.every(v => prop.values?.includes(v)))
                    return false;
            }
            return true;
        })?.value;
        finalProps[propName] = propValue ?? defaultProps[propName];
    }
    return prismarineBlockInstance.fromProperties(blockData.id, finalProps, 0);
};
