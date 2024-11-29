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
exports.CountryPhoneCurrency1701770990569 = void 0;
class CountryPhoneCurrency1701770990569 {
    constructor() {
        this.name = 'CountryPhoneCurrency1701770990569';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "currency" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "fullname" character varying NOT NULL, "symbol" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "country" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "fullname" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "phone_code" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_63535b596f66607b3da0ead52e4" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" ADD "phoneCodeId" bigint`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD "phoneCodeId" bigint`);
            yield queryRunner.query(`ALTER TABLE "currency" ADD CONSTRAINT "FK_f06fe84c2edce16808c79cf9f8e" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "phone_code" ADD CONSTRAINT "FK_62d3c2889dcb44ef26531d68dbf" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" ADD CONSTRAINT "FK_72e477e9d6c6796c698b7d5f198" FOREIGN KEY ("phoneCodeId") REFERENCES "phone_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_9dd433a6c032488b4ca015eba85" FOREIGN KEY ("phoneCodeId") REFERENCES "phone_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_9dd433a6c032488b4ca015eba85"`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" DROP CONSTRAINT "FK_72e477e9d6c6796c698b7d5f198"`);
            yield queryRunner.query(`ALTER TABLE "phone_code" DROP CONSTRAINT "FK_62d3c2889dcb44ef26531d68dbf"`);
            yield queryRunner.query(`ALTER TABLE "currency" DROP CONSTRAINT "FK_f06fe84c2edce16808c79cf9f8e"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP COLUMN "phoneCodeId"`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" DROP COLUMN "phoneCodeId"`);
            yield queryRunner.query(`DROP TABLE "phone_code"`);
            yield queryRunner.query(`DROP TABLE "country"`);
            yield queryRunner.query(`DROP TABLE "currency"`);
        });
    }
}
exports.CountryPhoneCurrency1701770990569 = CountryPhoneCurrency1701770990569;
