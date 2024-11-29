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
exports.Sh1702030811806 = void 0;
class Sh1702030811806 {
    constructor() {
        this.name = 'Sh1702030811806';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "street" ADD "entityProfileId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "street" ADD CONSTRAINT "FK_8364205dd4a5a8e3071a49135a8" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "street" DROP CONSTRAINT "FK_8364205dd4a5a8e3071a49135a8"`);
            yield queryRunner.query(`ALTER TABLE "street" DROP COLUMN "entityProfileId"`);
        });
    }
}
exports.Sh1702030811806 = Sh1702030811806;
