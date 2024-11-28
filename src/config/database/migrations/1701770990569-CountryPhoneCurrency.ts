import { MigrationInterface, QueryRunner } from 'typeorm';

export class CountryPhoneCurrency1701770990569 implements MigrationInterface {
  name = 'CountryPhoneCurrency1701770990569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "currency" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "fullname" character varying NOT NULL, "symbol" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "fullname" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "phone_code" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_63535b596f66607b3da0ead52e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_user_profile" ADD "phoneCodeId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD "phoneCodeId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency" ADD CONSTRAINT "FK_f06fe84c2edce16808c79cf9f8e" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_code" ADD CONSTRAINT "FK_62d3c2889dcb44ef26531d68dbf" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_user_profile" ADD CONSTRAINT "FK_72e477e9d6c6796c698b7d5f198" FOREIGN KEY ("phoneCodeId") REFERENCES "phone_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" ADD CONSTRAINT "FK_9dd433a6c032488b4ca015eba85" FOREIGN KEY ("phoneCodeId") REFERENCES "phone_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP CONSTRAINT "FK_9dd433a6c032488b4ca015eba85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_user_profile" DROP CONSTRAINT "FK_72e477e9d6c6796c698b7d5f198"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_code" DROP CONSTRAINT "FK_62d3c2889dcb44ef26531d68dbf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency" DROP CONSTRAINT "FK_f06fe84c2edce16808c79cf9f8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_subscriber_profile" DROP COLUMN "phoneCodeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_user_profile" DROP COLUMN "phoneCodeId"`,
    );
    await queryRunner.query(`DROP TABLE "phone_code"`);
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TABLE "currency"`);
  }
}
