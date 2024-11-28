import { MigrationInterface, QueryRunner } from 'typeorm';

export class CurrencyUpdate1703316358994 implements MigrationInterface {
  name = 'CurrencyUpdate1703316358994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "currency" ALTER COLUMN "fullname" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "currency" ALTER COLUMN "fullname" SET NOT NULL`,
    );
  }
}
