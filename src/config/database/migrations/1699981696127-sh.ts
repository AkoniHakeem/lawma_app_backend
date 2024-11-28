import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1699981696127 implements MigrationInterface {
    name = 'Sh1699981696127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entity_user_profile" ALTER COLUMN "phone" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entity_user_profile" ALTER COLUMN "phone" SET NOT NULL`);
    }

}
