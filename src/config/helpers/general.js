"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwBadRequest = exports.getWorkerLogger = exports.getLoggerFor = exports.pathFromRoot = exports.rootProjectDir = exports.pathFromSrc = void 0;
const path_1 = require("path");
const pino_1 = __importDefault(require("pino"));
const find_package_json_1 = __importDefault(require("find-package-json"));
const common_1 = require("@nestjs/common");
const pathFromSrc = (path) => {
    return (0, path_1.join)(__dirname, '../../', path);
};
exports.pathFromSrc = pathFromSrc;
const rootProjectDir = () => {
    const finder = (0, find_package_json_1.default)(__dirname);
    let isDone = false;
    while (!isDone) {
        const result = finder.next();
        isDone = true;
        return (0, path_1.dirname)(result.filename);
    }
    return process.cwd();
};
exports.rootProjectDir = rootProjectDir;
const pathFromRoot = (path) => {
    return (0, path_1.join)((0, exports.rootProjectDir)(), path);
};
exports.pathFromRoot = pathFromRoot;
const getLoggerFor = (destination = 'logs/uwebsockets.log') => {
    return (0, pino_1.default)({
        transport: {
            target: 'pino-pretty',
            options: {
                destination: (0, exports.pathFromRoot)(`${destination}`),
                colorize: false,
                mkdir: true,
                crlf: true,
            },
        },
    });
};
exports.getLoggerFor = getLoggerFor;
const getWorkerLogger = () => {
    return (0, exports.getLoggerFor)('logs/workers.log');
};
exports.getWorkerLogger = getWorkerLogger;
const throwBadRequest = (message) => {
    return new common_1.BadRequestException(message);
};
exports.throwBadRequest = throwBadRequest;
