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
exports.Sh1703453420900 = void 0;
class Sh1703453420900 {
    constructor() {
        this.name = 'Sh1703453420900';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_fa2599eede9337bb52313e2cb36"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "propertySubscriptionUnitsPropertySubscriptionId"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "propertySubscriptionUnitsEntiySubscriberPropertyId"`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "propertySubscriptionUnitsEntiySubscriberPropertyId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "propertySubscriptionUnitsPropertySubscriptionId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_fa2599eede9337bb52313e2cb36" FOREIGN KEY ("propertySubscriptionUnitsPropertySubscriptionId", "propertySubscriptionUnitsEntiySubscriberPropertyId") REFERENCES "property_subscription_unit"("propertySubscriptionId","entiySubscriberPropertyId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.Sh1703453420900 = Sh1703453420900;
