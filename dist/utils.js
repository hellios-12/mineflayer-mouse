"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionToNumber = void 0;
const versionToNumber = (ver) => {
    const [x, y = '0', z = '0'] = ver.split('.');
    return +`${x.padStart(2, '0')}${(parseInt(y).toString().padStart(2, '0'))}${parseInt(z).toString().padStart(2, '0')}`;
};
exports.versionToNumber = versionToNumber;
