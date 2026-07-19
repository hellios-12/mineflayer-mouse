"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEntityAttackable = void 0;
exports.isArmorStandAttackable = isArmorStandAttackable;
const change_case_1 = require("change-case");
const entityData_json_1 = __importDefault(require("./entityData.json"));
const debug_1 = require("./debug");
// TODO support REDIRECTABLE_PROJECTILE
const allEntityNames = Object.fromEntries([...entityData_json_1.default.attackable, ...entityData_json_1.default.notAttackable].map(x => [x, true]));
const attackableEntityNames = entityData_json_1.default.attackable;
const isEntityAttackable = (data, entity) => {
    if (!entity.name)
        throw new Error('Entity has no name');
    const originalEntityData = data.entitiesByName[entity.name];
    const entityRename = entityData_json_1.default.entityRenames[entity.name] || entityData_json_1.default.entityRenames[(0, change_case_1.snakeCase)(entity.name)];
    let latestEntityName = entityRename || entity.name;
    if (!allEntityNames[latestEntityName]) {
        latestEntityName = (0, change_case_1.snakeCase)(latestEntityName);
        if (!allEntityNames[latestEntityName]) {
            (0, debug_1.debug)(`Cannot find entity ${latestEntityName} in entityData.json`);
            return false;
        }
    }
    const hardcodedCheck = hardcodedChecks[latestEntityName];
    if (hardcodedCheck)
        return hardcodedCheck(entity, originalEntityData);
    return attackableEntityNames.includes(latestEntityName);
};
exports.isEntityAttackable = isEntityAttackable;
const hardcodedChecks = {
    armor_stand: isArmorStandAttackable
};
function isArmorStandAttackable(entity, entityData) {
    const clientFlags = Number(entity.metadata?.[entityData.metadataKeys?.indexOf('client_flags') ?? 14] ?? 0);
    const isMarker = (clientFlags & 16) !== 0;
    const showBasePlate = (clientFlags & 8) !== 0;
    const showArms = (clientFlags & 4) !== 0;
    const isSmall = (clientFlags & 1) !== 0;
    return !isMarker;
}
