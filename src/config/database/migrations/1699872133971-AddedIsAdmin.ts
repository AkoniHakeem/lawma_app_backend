import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedIsAdmin1699872133971 implements MigrationInterface {
  name = 'AddedIsAdmin1699872133971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_user_profile" DROP COLUMN "isAdmin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_collection" ADD "isAdmin" boolean NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_collection" DROP COLUMN "isAdmin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_user_profile" ADD "isAdmin" boolean NOT NULL DEFAULT false`,
    );
  }
}
