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
exports.Sh1697919149007 = void 0;
class Sh1697919149007 {
    constructor() {
        this.name = 'Sh1697919149007';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TYPE "public"."email_priority_enum" AS ENUM('immediate', 'regular', 'delayed')`);
            yield queryRunner.query(`CREATE TABLE "email" ("id" BIGSERIAL NOT NULL, "priority" "public"."email_priority_enum" NOT NULL DEFAULT 'regular', "attachmentFileUrls" jsonb, "body" json NOT NULL, "sendAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_1e7ed8734ee054ef18002e29b1c" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "sms" ("id" BIGSERIAL NOT NULL, "content" text NOT NULL, "sender" character varying NOT NULL, "to" character varying NOT NULL, CONSTRAINT "PK_60793c2f16aafe0513f8817eae8" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "lga_ward" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lgaId" bigint NOT NULL, CONSTRAINT "PK_c83c940e2d04dbf460ec5d950f9" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "lga" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "abbreviation" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_732755837379a4fff12c6b0f412" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "street" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "lgaId" bigint NOT NULL, "lgaWardId" bigint NOT NULL, CONSTRAINT "PK_5629a676c74c04f5845b964469c" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "property_type" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "unitPrice" numeric NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_eb483bf7f6ddf612998949edd26" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "entity_profile_preference" ("entityProfileId" bigint NOT NULL, "autoGenerateBills" character varying NOT NULL, CONSTRAINT "PK_a8f731fc8b85426ba275b377ddc" PRIMARY KEY ("entityProfileId"))`);
            yield queryRunner.query(`CREATE TABLE "entity_user_profile" ("id" BIGSERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "middleName" character varying, "email" character varying NOT NULL, "phone" character varying NOT NULL, "entityProfileId" bigint NOT NULL, CONSTRAINT "UQ_4b5ade5304fa8581cb0af0f9902" UNIQUE ("email"), CONSTRAINT "UQ_76e1a874d4915c7d390fa1c73ba" UNIQUE ("phone"), CONSTRAINT "PK_ed2cc6a17e618276474ac157e6b" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "entity_profile" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_664b32a943f98981b7db3bfaefa" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "billing" ("id" BIGSERIAL NOT NULL, "amount" numeric NOT NULL, "month" character varying NOT NULL, "year" character varying NOT NULL, "entitySubscriberProfileId" bigint NOT NULL, "entitySubscriberProertyId" bigint NOT NULL, CONSTRAINT "PK_d9043caf3033c11ed3d1b29f73c" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "entity_subscriber_profile" ("id" BIGSERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "middleName" character varying, "email" character varying, "phone" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entityProfileId" bigint NOT NULL, CONSTRAINT "UQ_f646c2b59a1708506380d14cfff" UNIQUE ("email"), CONSTRAINT "UQ_d93c2711e6c04fa07a0aa76f65a" UNIQUE ("phone"), CONSTRAINT "PK_7217f100ead640fba269025dc86" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "property_subscriber" ("entitySubscriberProfileId" bigint NOT NULL, "entitySubscriberPropertyId" bigint NOT NULL, "subscriberPropertyRole" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d65f713970b04a5042bed44fbab" PRIMARY KEY ("entitySubscriberProfileId", "entitySubscriberPropertyId", "subscriberPropertyRole"))`);
            yield queryRunner.query(`CREATE TABLE "entity_subscriber_property" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "streetNumber" integer NOT NULL, "oldCode" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "streetId" bigint NOT NULL, "propertyTypeId" bigint NOT NULL, "billingAccountId" bigint, CONSTRAINT "PK_8750204b686ee0e90ea4ee5e016" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "billing_account" ("id" BIGSERIAL NOT NULL, "totalBillings" numeric NOT NULL, "totalPayments" numeric NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entitySubscriberPropertyId" bigint NOT NULL, CONSTRAINT "PK_42d2c4ab8974627eb4ef1da8fb6" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "payment" ("id" BIGSERIAL NOT NULL, "amount" numeric NOT NULL, "date" date NOT NULL DEFAULT now(), "payer" character varying NOT NULL, "comments" character varying, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TYPE "public"."profile_collection_profiletype_enum" AS ENUM('entity_user_profile', 'entity_subscriber_profile')`);
            yield queryRunner.query(`CREATE TABLE "profile_collection" ("id" BIGSERIAL NOT NULL, "profileType" "public"."profile_collection_profiletype_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "profileTypeId" bigint NOT NULL, "userId" bigint NOT NULL, CONSTRAINT "PK_e5d01864c4c3af52721b886fe83" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "lga_ward" ADD CONSTRAINT "FK_761946510f11efe38df26b075fd" FOREIGN KEY ("lgaId") REFERENCES "lga"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "street" ADD CONSTRAINT "FK_bafc0d3f7fecccd03690ae1736b" FOREIGN KEY ("lgaId") REFERENCES "lga"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "street" ADD CONSTRAINT "FK_fcd21fc574fa2bf892bc5fd49a2" FOREIGN KEY ("lgaWardId") REFERENCES "lga_ward"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" ADD CONSTRAINT "FK_19b2f4ff2abd89dbe2b89cf8162" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD CONSTRAINT "FK_02821cf41d28d2940c51f0e9424" FOREIGN KEY ("entitySubscriberProertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing" ADD CONSTRAINT "FK_435cc3a0534871880c91256ed91" FOREIGN KEY ("entitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_d72ba5e8991a9a79a6399c3b241" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscriber" ADD CONSTRAINT "FK_0d705df7846db38ab2b63d6b32b" FOREIGN KEY ("entitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "property_subscriber" ADD CONSTRAINT "FK_587935f68ae4d6e9ac24577803f" FOREIGN KEY ("entitySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_504999c66323a54bd6c3a612897" FOREIGN KEY ("streetId") REFERENCES "street"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_593a6a55464ccfcbc145f2a04af" FOREIGN KEY ("propertyTypeId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_731c81c6a06eda8f9243afaa1e9" FOREIGN KEY ("billingAccountId") REFERENCES "billing_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "billing_account" ADD CONSTRAINT "FK_3b89fe380823ffbf39a27a95db3" FOREIGN KEY ("entitySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`CREATE TABLE "typeorm_cache_table" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_1f1c066da68820c20a4ff873df1" PRIMARY KEY ("id"))`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`DROP TABLE "typeorm_cache_table"`);
            yield queryRunner.query(`ALTER TABLE "billing_account" DROP CONSTRAINT "FK_3b89fe380823ffbf39a27a95db3"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_731c81c6a06eda8f9243afaa1e9"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_593a6a55464ccfcbc145f2a04af"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_504999c66323a54bd6c3a612897"`);
            yield queryRunner.query(`ALTER TABLE "property_subscriber" DROP CONSTRAINT "FK_587935f68ae4d6e9ac24577803f"`);
            yield queryRunner.query(`ALTER TABLE "property_subscriber" DROP CONSTRAINT "FK_0d705df7846db38ab2b63d6b32b"`);
            yield queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_d72ba5e8991a9a79a6399c3b241"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP CONSTRAINT "FK_435cc3a0534871880c91256ed91"`);
            yield queryRunner.query(`ALTER TABLE "billing" DROP CONSTRAINT "FK_02821cf41d28d2940c51f0e9424"`);
            yield queryRunner.query(`ALTER TABLE "entity_user_profile" DROP CONSTRAINT "FK_19b2f4ff2abd89dbe2b89cf8162"`);
            yield queryRunner.query(`ALTER TABLE "street" DROP CONSTRAINT "FK_fcd21fc574fa2bf892bc5fd49a2"`);
            yield queryRunner.query(`ALTER TABLE "street" DROP CONSTRAINT "FK_bafc0d3f7fecccd03690ae1736b"`);
            yield queryRunner.query(`ALTER TABLE "lga_ward" DROP CONSTRAINT "FK_761946510f11efe38df26b075fd"`);
            yield queryRunner.query(`DROP TABLE "profile_collection"`);
            yield queryRunner.query(`DROP TYPE "public"."profile_collection_profiletype_enum"`);
            yield queryRunner.query(`DROP TABLE "payment"`);
            yield queryRunner.query(`DROP TABLE "billing_account"`);
            yield queryRunner.query(`DROP TABLE "entity_subscriber_property"`);
            yield queryRunner.query(`DROP TABLE "property_subscriber"`);
            yield queryRunner.query(`DROP TABLE "entity_subscriber_profile"`);
            yield queryRunner.query(`DROP TABLE "billing"`);
            yield queryRunner.query(`DROP TABLE "entity_profile"`);
            yield queryRunner.query(`DROP TABLE "entity_user_profile"`);
            yield queryRunner.query(`DROP TABLE "entity_profile_preference"`);
            yield queryRunner.query(`DROP TABLE "property_type"`);
            yield queryRunner.query(`DROP TABLE "street"`);
            yield queryRunner.query(`DROP TABLE "lga"`);
            yield queryRunner.query(`DROP TABLE "lga_ward"`);
            yield queryRunner.query(`DROP TABLE "sms"`);
            yield queryRunner.query(`DROP TABLE "email"`);
            yield queryRunner.query(`DROP TYPE "public"."email_priority_enum"`);
        });
    }
}
exports.Sh1697919149007 = Sh1697919149007;
