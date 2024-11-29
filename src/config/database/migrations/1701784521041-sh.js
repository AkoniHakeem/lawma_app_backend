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
exports.Sh1701784521041 = void 0;
class Sh1701784521041 {
    constructor() {
        this.name = 'Sh1701784521041';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "property_subscription" RENAME COLUMN "subscriberPropertyRole" TO "subscriberProfileRole"`);
            yield queryRunner.query(`ALTER TYPE "public"."property_subscription_subscriberpropertyrole_enum" RENAME TO "property_subscription_subscriberprofilerole_enum"`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TYPE "public"."property_subscription_subscriberprofilerole_enum" RENAME TO "property_subscription_subscriberpropertyrole_enum"`);
            yield queryRunner.query(`ALTER TABLE "property_subscription" RENAME COLUMN "subscriberProfileRole" TO "subscriberPropertyRole"`);
        });
    }
}
exports.Sh1701784521041 = Sh1701784521041;
