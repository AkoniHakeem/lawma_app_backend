import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1703453420900 implements MigrationInterface {
  name = 'Sh1703453420900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_fa2599eede9337bb52313e2cb36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" DROP COLUMN "propertySubscriptionUnitsPropertySubscriptionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" DROP COLUMN "propertySubscriptionUnitsEntiySubscriberPropertyId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" ADD "propertySubscriptionUnitsEntiySubscriberPropertyId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" ADD "propertySubscriptionUnitsPropertySubscriptionId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_fa2599eede9337bb52313e2cb36" FOREIGN KEY ("propertySubscriptionUnitsPropertySubscriptionId", "propertySubscriptionUnitsEntiySubscriberPropertyId") REFERENCES "property_subscription_unit"("propertySubscriptionId","entiySubscriberPropertyId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
