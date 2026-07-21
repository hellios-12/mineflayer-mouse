"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raycastEntity = raycastEntity;
const vec3_1 = require("vec3");
const iterators = __importStar(require("prismarine-world/src/iterators"));
const botCommon_1 = require("./botCommon");
const attackableEntity_1 = require("./attackableEntity");
const minecraft_data_1 = __importDefault(require("minecraft-data"));
function raycastEntity(bot, maxDistance) {
    if (!bot.entity)
        return null;
    const minecraftData = (0, minecraft_data_1.default)(bot.version);
    // TODO shouldn't .5 be added to maxDistance?
    maxDistance ??= bot.game.gameMode === 'creative' ? 5 : 3;
    const block = bot.blockAtCursor(maxDistance);
    maxDistance = block?.['intersect'].distanceTo(bot.entity.position) ?? maxDistance;
    const entities = bot.entities;
    const dir = new vec3_1.Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.yaw) * Math.cos(bot.entity.pitch));
    const iterator = new iterators.RaycastIterator(bot.entity.position.offset(0, (0, botCommon_1.getBotEyeHeight)(bot), 0), dir.normalize(), maxDistance);
    let result = null;
    let minDist = maxDistance;
    for (const entity of Object.values(entities)) {
        if (entity === bot.entity)
            continue;
        if (!entity.width || !entity.height)
            continue;
        if (!entity.position)
            continue;
        const w = entity.width / 2;
        const shapes = [[-w, 0, -w, w, entity.height, w]];
        const intersect = iterator.intersect(shapes, entity.position);
        if (intersect) {
            const entityDir = entity.position.minus(bot.entity.position); // Can be combined into 1 line
            const sign = Math.sign(entityDir.dot(dir));
            if (sign !== -1) {
                const dist = bot.entity.position.distanceTo(intersect.pos);
                if (dist < minDist) {
                    if ((0, attackableEntity_1.isEntityAttackable)(minecraftData, entity)) {
                        minDist = dist;
                        result = entity;
                    }
                }
            }
        }
    }
    return result;
}
