"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = void 0;
const typeorm_1 = require("typeorm");
const ormconfig_1 = __importDefault(require("../../../../ormconfig"));
const lodash_1 = require("lodash");
const worker_threads_1 = require("worker_threads");
const until_promise_1 = __importDefault(require("until-promise"));
const dataSourceConfig = ormconfig_1.default;
if (!worker_threads_1.isMainThread) {
    (0, lodash_1.set)(dataSourceConfig, 'extra.max', 1);
}
const dataSource = new typeorm_1.DataSource(dataSourceConfig);
let pool = undefined;
const getPool = () => __awaiter(void 0, void 0, void 0, function* () {
    const poolRef = yield (0, until_promise_1.default)(() => {
        const poolRef = pool;
        if (!poolRef) {
            throw new Error('Oops.. Pool is not yet available');
        }
        return poolRef;
    }, (resp) => !!resp, {
        wait: 300,
    });
    return poolRef;
});
exports.getPool = getPool;
dataSource
    .initialize()
    .then(() => {
    pool = (0, lodash_1.get)(dataSource.driver, 'master');
})
    .catch((err) => {
    console.error('Error during Default Data Source initialization', err);
});
exports.default = dataSource;
