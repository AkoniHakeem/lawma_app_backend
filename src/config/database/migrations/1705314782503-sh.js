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
exports.Sh1705314782503 = void 0;
class Sh1705314782503 {
    constructor() {
        this.name = 'Sh1705314782503';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "date"`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "paymentDate" date NOT NULL DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "deletedAt"`);
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "updatedAt"`);
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "createdAt"`);
            yield queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "paymentDate"`);
            yield queryRunner.query(`ALTER TABLE "payment" ADD "date" date NOT NULL DEFAULT now()`);
        });
    }
}
exports.Sh1705314782503 = Sh1705314782503;
