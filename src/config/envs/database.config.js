"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
exports.default = () => ({
    url: _1.default.DATABASE_URL,
    host: _1.default.DB_HOST,
    port: parseInt(String(_1.default.DB_PORT || '5432'), 10) || 5432,
    username: _1.default.DB_USER,
    password: _1.default.DB_PASSWORD,
    database: _1.default.DB_NAME,
    maxPoolConnCount: parseInt(String(_1.default.DB_CONN_POOL_COUNT), 10) || 10,
});
