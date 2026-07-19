"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isItemActivatable = void 0;
const minecraft_data_1 = __importDefault(require("minecraft-data"));
const itemBlocksStatic_1 = require("./itemBlocksStatic");
const isItemActivatable = (version, item) => {
    if (!item)
        return false;
    const mcData = (0, minecraft_data_1.default)(version);
    const blockData = mcData.blocksByName[itemBlocksStatic_1.itemToBlockRemaps[item.name] ?? item.name];
    if (blockData) {
        return false;
    }
    return true;
};
exports.isItemActivatable = isItemActivatable;
