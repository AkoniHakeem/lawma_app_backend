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
exports.UpdatedPaymentMig1699438815934 = void 0;
class UpdatedPaymentMig1699438815934 {
    constructor() {
        this.name = 'UpdatedPaymentMig1699438815934';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "payer"`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "payerName" character varying NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "entitySubscriberPropertyId" bigint NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_a43a3432712abf6999a2d2b04d5" FOREIGN KEY ("entitySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_a43a3432712abf6999a2d2b04d5"`);
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "entitySubscriberPropertyId"`);
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "payerName"`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" DROP COLUMN "isAdmin"`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "payer" character varying NOT NULL`);
        });
    }
}
exports.UpdatedPaymentMig1699438815934 = UpdatedPaymentMig1699438815934;
