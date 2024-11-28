import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1700341711893 implements MigrationInterface {
    name = 'Sh1700341711893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entity_user_profile" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "entity_user_profile" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entity_user_profile" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "entity_user_profile" DROP COLUMN "createdAt"`);
    }

}
