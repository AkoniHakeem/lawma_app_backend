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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddedIsAdmin1699872133971 = void 0;
class AddedIsAdmin1699872133971 {
    constructor() {
        this.name = 'AddedIsAdmin1699872133971';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" DROP COLUMN "isAdmin"`);
            yield queryRunner.query(`ALTER TABLE "profile_collection" ADD "isAdmin" boolean NOT NULL`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "profile_collection" DROP COLUMN "isAdmin"`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
        });
    }
}
exports.AddedIsAdmin1699872133971 = AddedIsAdmin1699872133971;
