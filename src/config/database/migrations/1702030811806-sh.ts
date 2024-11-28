import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1702030811806 implements MigrationInterface {
  name = 'Sh1702030811806';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "street" ADD "entityProfileId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "street" ADD CONSTRAINT "FK_8364205dd4a5a8e3071a49135a8" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "street" DROP CONSTRAINT "FK_8364205dd4a5a8e3071a49135a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "street" DROP COLUMN "entityProfileId"`,
    );
  }
}
