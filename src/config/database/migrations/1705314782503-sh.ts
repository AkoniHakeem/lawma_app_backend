import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1705314782503 implements MigrationInterface {
    name = 'Sh1705314782503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "paymentDate" date NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "paymentDate"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "date" date NOT NULL DEFAULT now()`);
    }

}
