import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1701784521041 implements MigrationInterface {
  name = 'Sh1701784521041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" RENAME COLUMN "subscriberPropertyRole" TO "subscriberProfileRole"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."property_subscription_subscriberpropertyrole_enum" RENAME TO "property_subscription_subscriberprofilerole_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."property_subscription_subscriberprofilerole_enum" RENAME TO "property_subscription_subscriberpropertyrole_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_subscription" RENAME COLUMN "subscriberProfileRole" TO "subscriberPropertyRole"`,
    );
  }
}
