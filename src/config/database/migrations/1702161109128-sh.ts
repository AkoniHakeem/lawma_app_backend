import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1702161109128 implements MigrationInterface {
  name = 'Sh1702161109128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_type" ADD "entityProfileId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_profile" ADD "propertyTypesId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_type" ADD CONSTRAINT "FK_63fe0e4f47eb90cdbf53cb30856" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_profile" ADD CONSTRAINT "FK_bb2eb95bd4f884731c5102ae732" FOREIGN KEY ("propertyTypesId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_profile" DROP CONSTRAINT "FK_bb2eb95bd4f884731c5102ae732"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_type" DROP CONSTRAINT "FK_63fe0e4f47eb90cdbf53cb30856"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_profile" DROP COLUMN "propertyTypesId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_type" DROP COLUMN "entityProfileId"`,
    );
  }
}
