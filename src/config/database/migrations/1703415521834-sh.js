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
exports.Sh1703415521834 = void 0;
class Sh1703415521834 {
    constructor() {
        this.name = 'Sh1703415521834';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD "createdByEntityUserProfileId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD "createdByEntityProfileId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_c95afe7175f2741c7cbe8af560f" FOREIGN KEY ("createdByEntityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_fadf4127f31beab3baecd4ed875" FOREIGN KEY ("createdByEntityUserProfileId") REFERENCES "entity_user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_fadf4127f31beab3baecd4ed875"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_c95afe7175f2741c7cbe8af560f"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP COLUMN "createdByEntityProfileId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP COLUMN "createdByEntityUserProfileId"`);
        });
    }
}
exports.Sh1703415521834 = Sh1703415521834;
