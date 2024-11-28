import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1701786198540 implements MigrationInterface {
  name = 'Sh1701786198540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ADD "propertySubscriptionName" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" DROP COLUMN "propertySubscriptionName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" ADD "name" character varying NOT NULL`,
    );
  }
}
