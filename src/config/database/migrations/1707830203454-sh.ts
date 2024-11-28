import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1707830203454 implements MigrationInterface {
  name = 'Sh1707830203454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ALTER COLUMN "oldCode" TYPE character varying`,
    );
    // await queryRunner.query(
    //   `ALTER TABLE "property_subscription" ADD "oldCode" character varying`,
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_subscription" ALTER COLUMN "oldCode" TYPE bigint;
      `,
    );
    // await queryRunner.query(
    //   `ALTER TABLE "property_subscription" ADD "oldCode" bigint`,
    // );
  }
}
