"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotEyeHeight = void 0;
const getBotEyeHeight = (bot) => {
    // todo use bot.entity.eyeHeight when its not broken
    return bot.controlState.sneak ? 1.27 : 1.62;
};
exports.getBotEyeHeight = getBotEyeHeight;
