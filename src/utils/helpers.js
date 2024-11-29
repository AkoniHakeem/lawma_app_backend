"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwUnathorized = exports.throwForbidden = exports.throwBadRequest = exports.trimObject = exports.getConstructor = exports.createObject = void 0;
const common_1 = require("@nestjs/common");
function createObject(propsValues) {
    const objectTypeBluePrint = getConstructor(propsValues);
    return new objectTypeBluePrint();
}
exports.createObject = createObject;
function getConstructor(propsValues) {
    return class {
        constructor() {
            if (propsValues) {
                Object.assign(this, propsValues);
            }
        }
    };
}
exports.getConstructor = getConstructor;
function trimObject(propsValues, propsToDelete) {
    return propsToDelete.reduce((prev, curr) => {
        if (curr in prev) {
            delete prev[curr];
        }
        return prev;
    }, propsValues);
}
exports.trimObject = trimObject;
// export const encoder = new Hashids(process.env.APP_KEY, 6, '0123456789BCDGTN');
// export const encodeId = (id: string): string => {
//   return encoder.encode(id);
// };
// export const decodeId = (hash: string): string | false => {
//   try {
//     const data = encoder.decode(hash);
//     if (!data || isEmpty(data) || get(data, '0', 'undefined') === 'undefined')
//       return false;
//     return String(data[0]);
//   } catch {
//     return false;
//   }
// };
const throwBadRequest = (message) => {
    throw new common_1.HttpException(message, common_1.HttpStatus.BAD_REQUEST);
};
exports.throwBadRequest = throwBadRequest;
const throwForbidden = (message) => {
    throw new common_1.HttpException(message, common_1.HttpStatus.FORBIDDEN);
};
exports.throwForbidden = throwForbidden;
const throwUnathorized = (message) => {
    throw new common_1.HttpException(message, common_1.HttpStatus.UNAUTHORIZED);
};
exports.throwUnathorized = throwUnathorized;
