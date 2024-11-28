import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedPropertySubscription1701993370119
  implements MigrationInterface
{
  name = 'UpdatedPropertySubscription1701993370119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_d72ba5e8991a9a79a6399c3b241"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP COLUMN "entityProfileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ADD "entityProfileId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_account" ALTER COLUMN "totalBillings" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_account" ALTER COLUMN "totalPayments" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" ADD CONSTRAINT "FK_51e2d3135bd6f6f55a616847c00" FOREIGN KEY ("ownerEntitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ADD CONSTRAINT "FK_13b5a29acfb80dd14d9e2d41f1a" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" DROP CONSTRAINT "FK_13b5a29acfb80dd14d9e2d41f1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_property" DROP CONSTRAINT "FK_51e2d3135bd6f6f55a616847c00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_account" ALTER COLUMN "totalPayments" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_account" ALTER COLUMN "totalBillings" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" DROP COLUMN "entityProfileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD "entityProfileId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_d72ba5e8991a9a79a6399c3b241" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
