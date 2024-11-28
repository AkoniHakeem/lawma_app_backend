import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPaymentMig1699438815934 implements MigrationInterface {
    name = 'UpdatedPaymentMig1699438815934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "payer"`);
        await queryRunner.query(`ALTER TABLE "entity_user_profile" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "payerName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "entitySubscriberPropertyId" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_a43a3432712abf6999a2d2b04d5" FOREIGN KEY ("entitySubscriberPropertyId") REFERENCES "entity_subscriber_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_a43a3432712abf6999a2d2b04d5"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "entitySubscriberPropertyId"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "payerName"`);
        await queryRunner.query(`ALTER TABLE "entity_user_profile" DROP COLUMN "isAdmin"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "payer" character varying NOT NULL`);
    }

}
