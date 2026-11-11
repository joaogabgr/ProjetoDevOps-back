import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Campos do cadastro de estação do RF2: bioma, comunidade, fuso, tempo limite sem
 * comunicação (RF10) e ativa/desativada.
 *
 * Estações que já existiam recebem valores provisórios para que as colunas possam
 * ser obrigatórias; o técnico corrige pela edição.
 */
export class AddStationLocationFields1726900003000 implements MigrationInterface {
  name = 'AddStationLocationFields1726900003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "station_biome" AS ENUM ('PANTANAL', 'CERRADO', 'AMAZONIA')`);
    await queryRunner.query(`
      ALTER TABLE "stations"
        ADD "biome"                         "station_biome" NULL,
        ADD "community"                     varchar(120)    NULL,
        ADD "timezone"                      varchar(64)     NULL,
        ADD "communication_timeout_minutes" integer         NOT NULL DEFAULT 60,
        ADD "active"                        boolean         NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      UPDATE "stations"
         SET "biome" = 'PANTANAL', "community" = 'Não informada', "timezone" = 'America/Campo_Grande'
       WHERE "biome" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "stations"
        ALTER COLUMN "biome"     SET NOT NULL,
        ALTER COLUMN "community" SET NOT NULL,
        ALTER COLUMN "timezone"  SET NOT NULL,
        ADD CONSTRAINT "chk_stations_timeout" CHECK ("communication_timeout_minutes" BETWEEN 15 AND 1440)
    `);
    await queryRunner.query(`CREATE INDEX "idx_stations_community" ON "stations" ("community")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_stations_community"`);
    await queryRunner.query(`
      ALTER TABLE "stations"
        DROP CONSTRAINT "chk_stations_timeout",
        DROP COLUMN "active",
        DROP COLUMN "communication_timeout_minutes",
        DROP COLUMN "timezone",
        DROP COLUMN "community",
        DROP COLUMN "biome"
    `);
    await queryRunner.query(`DROP TYPE "station_biome"`);
  }
}
