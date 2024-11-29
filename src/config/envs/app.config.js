"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const _1 = __importDefault(require("."));
const getAppConfig = () => {
    let nodeEnv = String(_1.default.NODE_ENV).toLowerCase();
    if (!['development', 'staging', 'production', 'test'].includes(nodeEnv)) {
        nodeEnv = 'development';
    }
    return {
        NODE_ENV: nodeEnv,
        PROJECT_NAME: _1.default.PROJECT_NAME,
        SERVER_URL: String(_1.default.SERVER_URL).toLowerCase(),
        SERVER_HOST: _1.default.SERVER_HOST,
        SERVER_PORT: parseInt(_1.default.SERVER_PORT || '80') || 80,
        APP_KEY: _1.default.APP_KEY,
        JWT_SECRET: _1.default.JWT_SECRET,
        JWT_EXPIRY: _1.default.JWT_EXPIRY || '8h',
        HASH_SALT_ROUNDS: _1.default.HASH_SALT_ROUNDS,
        DEFAULT_USER_PASSWORD: _1.default.DEFAULT_USER_PASSWORD,
        API_ACCESS_TOKEN_EXPIRY: _1.default.API_ACCESS_TOKEN_EXPIRY || '365d',
    };
};
exports.default = (0, config_1.registerAs)('app', getAppConfig);
