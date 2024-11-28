import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1723108069535 implements MigrationInterface {
    name = 'Sh1723108069535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet_reference" ("id" BIGSERIAL NOT NULL, "publicReference" character varying NOT NULL, "authenticatedUserId" bigint NOT NULL, "isCompanyWallet" boolean NOT NULL DEFAULT false, "currencyId" bigint NOT NULL, CONSTRAINT "PK_5480208d75bbdcf6023de79fd6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscriber_virtual_account_detail" ("id" BIGSERIAL NOT NULL, "account_number" character varying NOT NULL, "account_name" character varying NOT NULL, "bank" character varying NOT NULL, "propertySubscriptionId" bigint NOT NULL, CONSTRAINT "PK_f4f9120a2279d9225dce85e037b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "entity_subscriber_profile" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "wallet_reference" ADD CONSTRAINT "FK_d6e7070da68b0e9493276fd20e6" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriber_virtual_account_detail" ADD CONSTRAINT "FK_7a1f2f52d841c3ea8319797e974" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriber_virtual_account_detail" DROP CONSTRAINT "FK_7a1f2f52d841c3ea8319797e974"`);
        await queryRunner.query(`ALTER TABLE "wallet_reference" DROP CONSTRAINT "FK_d6e7070da68b0e9493276fd20e6"`);
        await queryRunner.query(`ALTER TABLE "entity_subscriber_profile" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`DROP TABLE "subscriber_virtual_account_detail"`);
        await queryRunner.query(`DROP TABLE "wallet_reference"`);
    }

}
