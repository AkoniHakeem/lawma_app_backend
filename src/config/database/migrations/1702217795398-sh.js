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
exports.Sh1702217795398 = void 0;
class Sh1702217795398 {
    constructor() {
        this.name = 'Sh1702217795398';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "property_subscription" DROP COLUMN "deletedAt"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP COLUMN "deletedAt"`);
        });
    }
}
exports.Sh1702217795398 = Sh1702217795398;
