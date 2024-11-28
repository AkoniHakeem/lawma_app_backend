import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1701805939106 implements MigrationInterface {
  name = 'Sh1701805939106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" DROP COLUMN "streetNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ADD "streetNumber" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" DROP COLUMN "streetNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ADD "streetNumber" integer NOT NULL`,
    );
  }
}
