"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMouse = void 0;
const mouse_1 = require("./mouse");
const createMouse = (settings = {}) => {
    return (bot) => (0, mouse_1.inject)(bot, settings);
};
exports.createMouse = createMouse;
