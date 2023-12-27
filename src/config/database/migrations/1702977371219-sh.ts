import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1702977371219 implements MigrationInterface {
  name = 'Sh1702977371219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "street" DROP CONSTRAINT "FK_bafc0d3f7fecccd03690ae1736b"`,
    );
    await queryRunner.query(`ALTER TABLE "street" DROP COLUMN "lgaId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "street" ADD "lgaId" bigint NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "street" ADD CONSTRAINT "FK_bafc0d3f7fecccd03690ae1736b" FOREIGN KEY ("lgaId") REFERENCES "lga"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
