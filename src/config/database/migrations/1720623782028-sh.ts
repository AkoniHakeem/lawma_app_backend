import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1720623782028 implements MigrationInterface {
    name = 'Sh1720623782028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "arrears_update" ("id" BIGSERIAL NOT NULL, "amountBeforeUpdate" numeric NOT NULL, "amountAfterUpdate" numeric NOT NULL, "reasonToUpdate" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "propertySubscriptionId" bigint NOT NULL, "updatedByUserId" bigint, CONSTRAINT "PK_cca6e02d337cd6fd438bf00b69c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "arrears_update" ADD CONSTRAINT "FK_60debebd14eaeee277b945e29b5" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "arrears_update" ADD CONSTRAINT "FK_9d3168864c286d960596777076b" FOREIGN KEY ("updatedByUserId") REFERENCES "entity_user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "arrears_update" DROP CONSTRAINT "FK_9d3168864c286d960596777076b"`);
        await queryRunner.query(`ALTER TABLE "arrears_update" DROP CONSTRAINT "FK_60debebd14eaeee277b945e29b5"`);
        await queryRunner.query(`DROP TABLE "arrears_update"`);
    }

}
