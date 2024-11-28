import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1703415521834 implements MigrationInterface {
  name = 'Sh1703415521834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD "createdByEntityUserProfileId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD "createdByEntityProfileId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_c95afe7175f2741c7cbe8af560f" FOREIGN KEY ("createdByEntityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_fadf4127f31beab3baecd4ed875" FOREIGN KEY ("createdByEntityUserProfileId") REFERENCES "entity_user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_fadf4127f31beab3baecd4ed875"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_c95afe7175f2741c7cbe8af560f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP COLUMN "createdByEntityProfileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP COLUMN "createdByEntityUserProfileId"`,
    );
  }
}
