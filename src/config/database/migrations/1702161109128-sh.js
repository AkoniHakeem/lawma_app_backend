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
exports.Sh1702161109128 = void 0;
class Sh1702161109128 {
    constructor() {
        this.name = 'Sh1702161109128';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "property_type" ADD "entityProfileId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "entity_profile" ADD "propertyTypesId" bigint`);
            yield queryRunner.query(`ALTER TABLE "property_type" ADD CONSTRAINT "FK_63fe0e4f47eb90cdbf53cb30856" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_profile" ADD CONSTRAINT "FK_bb2eb95bd4f884731c5102ae732" FOREIGN KEY ("propertyTypesId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_profile" DROP CONSTRAINT "FK_bb2eb95bd4f884731c5102ae732"`);
            yield queryRunner.query(`ALTER TABLE "property_type" DROP CONSTRAINT "FK_63fe0e4f47eb90cdbf53cb30856"`);
            yield queryRunner.query(`ALTER TABLE "entity_profile" DROP COLUMN "propertyTypesId"`);
            yield queryRunner.query(`ALTER TABLE "property_type" DROP COLUMN "entityProfileId"`);
        });
    }
}
exports.Sh1702161109128 = Sh1702161109128;
