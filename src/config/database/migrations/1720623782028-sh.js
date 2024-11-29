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
exports.Sh1720623782028 = void 0;
class Sh1720623782028 {
    constructor() {
        this.name = 'Sh1720623782028';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "arrears_update" ("id" BIGSERIAL NOT NULL, "amountBeforeUpdate" numeric NOT NULL, "amountAfterUpdate" numeric NOT NULL, "reasonToUpdate" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "propertySubscriptionId" bigint NOT NULL, "updatedByUserId" bigint, CONSTRAINT "PK_cca6e02d337cd6fd438bf00b69c" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "arrears_update" ADD CONSTRAINT "FK_60debebd14eaeee277b945e29b5" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "arrears_update" ADD CONSTRAINT "FK_9d3168864c286d960596777076b" FOREIGN KEY ("updatedByUserId") REFERENCES "entity_user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "arrears_update" DROP CONSTRAINT "FK_9d3168864c286d960596777076b"`);
            yield queryRunner.query(`ALTER TABLE "arrears_update" DROP CONSTRAINT "FK_60debebd14eaeee277b945e29b5"`);
            yield queryRunner.query(`DROP TABLE "arrears_update"`);
        });
    }
}
exports.Sh1720623782028 = Sh1720623782028;
