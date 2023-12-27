import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1702217795398 implements MigrationInterface {
  name = 'Sh1702217795398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" DROP COLUMN "deletedAt"`,
    );
  }
}
