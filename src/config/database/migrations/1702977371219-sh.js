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
exports.Sh1702977371219 = void 0;
class Sh1702977371219 {
    constructor() {
        this.name = 'Sh1702977371219';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "street" DROP CONSTRAINT "FK_bafc0d3f7fecccd03690ae1736b"`);
            yield queryRunner.query(`ALTER TABLE "street" DROP COLUMN "lgaId"`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "street" ADD "lgaId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "street" ADD CONSTRAINT "FK_bafc0d3f7fecccd03690ae1736b" FOREIGN KEY ("lgaId") REFERENCES "lga"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.Sh1702977371219 = Sh1702977371219;
