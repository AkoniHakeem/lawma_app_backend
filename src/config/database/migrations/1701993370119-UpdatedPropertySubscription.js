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
exports.UpdatedPropertySubscription1701993370119 = void 0;
class UpdatedPropertySubscription1701993370119 {
    constructor() {
        this.name = 'UpdatedPropertySubscription1701993370119';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_d72ba5e8991a9a79a6399c3b241"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP COLUMN "entityProfileId"`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" ADD "entityProfileId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ALTER COLUMN "totalBillings" SET DEFAULT '0'`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ALTER COLUMN "totalPayments" SET DEFAULT '0'`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_51e2d3135bd6f6f55a616847c00" FOREIGN KEY ("ownerEntitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" ADD CONSTRAINT "FK_13b5a29acfb80dd14d9e2d41f1a" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "property_subscription" DROP CONSTRAINT "FK_13b5a29acfb80dd14d9e2d41f1a"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_51e2d3135bd6f6f55a616847c00"`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ALTER COLUMN "totalPayments" DROP DEFAULT`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ALTER COLUMN "totalBillings" DROP DEFAULT`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" DROP COLUMN "entityProfileId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD "entityProfileId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_d72ba5e8991a9a79a6399c3b241" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.UpdatedPropertySubscription1701993370119 = UpdatedPropertySubscription1701993370119;
