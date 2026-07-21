"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenamedData = void 0;
const itemBlockRenames_json_1 = __importDefault(require("./itemBlockRenames.json"));
const utils_1 = require("./utils");
// postflatenning
// todo regen 1.13 the flatenning data
// const allRenamesMapFromLatest = Object.fromEntries(
//   ['blocks', 'items'].map(x =>
//     [
//       x,
//       Object.fromEntries(Object.entries(itemBlockRenames).flatMap(([ver, t]) => t[x]?.map(([oldName, newName]) => [
//         newName,
//         { version: versionToNumber(ver), oldName }
//       ])).filter(x => x))
//     ])
// ) as { [thing: string]: Record<string, { version: number, oldName: string }> }
const getRenamedData = (type, blockOrItem, versionFrom, versionTo) => {
    const verFrom = (0, utils_1.versionToNumber)(versionFrom);
    const verTo = (0, utils_1.versionToNumber)(versionTo);
    const dir = verFrom < verTo ? 1 : -1;
    const targetIdx = dir > 0 ? 1 : 0;
    let renamed = blockOrItem;
    const mapVersions = Object.keys(itemBlockRenames_json_1.default).sort((a, b) => dir * ((0, utils_1.versionToNumber)(a) - (0, utils_1.versionToNumber)(b)));
    const upperBoundVer = dir > 0 ? verTo : verFrom;
    const lowerBoundVer = dir > 0 ? verFrom : verTo;
    for (const mapVersion of mapVersions.filter(x => (0, utils_1.versionToNumber)(x) <= upperBoundVer && (0, utils_1.versionToNumber)(x) >= lowerBoundVer)) {
        if (dir > 0 && (0, utils_1.versionToNumber)(mapVersion) >= upperBoundVer)
            break;
        if (dir < 0 && (0, utils_1.versionToNumber)(mapVersion) <= lowerBoundVer)
            break;
        const nextMapData = itemBlockRenames_json_1.default[mapVersion][type];
        if (!nextMapData)
            continue;
        for (const namesArr of nextMapData) {
            const targetName = namesArr[targetIdx];
            const compareName = namesArr[1 - targetIdx];
            if (Array.isArray(renamed)) {
                if (renamed.includes(compareName))
                    renamed = renamed.map(x => x === compareName ? targetName : x);
            }
            else if (renamed === compareName) {
                renamed = targetName;
                break;
            }
        }
    }
    return renamed;
};
exports.getRenamedData = getRenamedData;
