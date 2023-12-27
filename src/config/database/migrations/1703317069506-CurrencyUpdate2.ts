import { MigrationInterface, QueryRunner } from "typeorm";

export class CurrencyUpdate21703317069506 implements MigrationInterface {
    name = 'CurrencyUpdate21703317069506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "currency" ALTER COLUMN "symbol" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "currency" ALTER COLUMN "symbol" SET NOT NULL`);
    }

}
