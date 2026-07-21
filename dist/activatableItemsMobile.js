"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isItemActivatableMobile = void 0;
const activatableItemsMobile_json_1 = __importDefault(require("./activatableItemsMobile.json"));
exports.default = activatableItemsMobile_json_1.default;
const isItemActivatableMobile = (itemName, data) => {
    return activatableItemsMobile_json_1.default.includes(itemName) || data.foodsByName[itemName] !== undefined;
};
exports.isItemActivatableMobile = isItemActivatableMobile;
