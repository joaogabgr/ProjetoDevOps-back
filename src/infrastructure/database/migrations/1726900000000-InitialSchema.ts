import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema inicial da plataforma de monitoramento ambiental.
 *
 * Escrito à mão (em vez de gerado) para deixar explícitas as decisões que o
 * `migration:generate` não tem como tomar: nomes das constraints, ordem de criação
 * e as regras de `ON DELETE`.
 */
export class InitialSchema1726900000000 implements MigrationInterface {
  name = 'InitialSchema1726900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ---------------------------------------------------------------- enums
    await queryRunner.query(`CREATE TYPE "user_role" AS ENUM ('ADMIN', 'EMPLOYEE', 'PUBLIC')`);
    await queryRunner.query(`CREATE TYPE "average_type" AS ENUM ('HOURLY', 'DAILY')`);
    await queryRunner.query(
      `CREATE TYPE "comparison_operator" AS ENUM ('GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ')`,
    );

    // ---------------------------------------------------------------- users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         uuid         NOT NULL DEFAULT gen_random_uuid(),
        "name"       varchar(255) NOT NULL,
        "email"      varchar(255) NOT NULL,
        "password"   varchar(255) NOT NULL,
        "role"       "user_role"  NOT NULL,
        "cpf"        char(11)     NOT NULL,
        "created_at" timestamptz  NOT NULL DEFAULT now(),
        "active"     boolean      NOT NULL DEFAULT true,
        CONSTRAINT "pk_users"       PRIMARY KEY ("id"),
        CONSTRAINT "uq_users_email" UNIQUE ("email"),
        CONSTRAINT "uq_users_cpf"   UNIQUE ("cpf")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role")`);

    // ------------------------------------------------------------- stations
    await queryRunner.query(`
      CREATE TABLE "stations" (
        "id"                uuid         NOT NULL DEFAULT gen_random_uuid(),
        "uuid"              varchar(255) NOT NULL,
        "name"              varchar(255) NOT NULL,
        "latitude"          varchar(64)  NOT NULL,
        "longitude"         varchar(64)  NOT NULL,
        "created_at"        timestamptz  NOT NULL DEFAULT now(),
        "date_last_measure" bigint       NULL,
        CONSTRAINT "pk_stations"      PRIMARY KEY ("id"),
        CONSTRAINT "uq_stations_uuid" UNIQUE ("uuid")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_stations_name" ON "stations" ("name")`);

    // ------------------------------------------------------- type_parameters
    await queryRunner.query(`
      CREATE TABLE "type_parameters" (
        "id"                      bigserial    NOT NULL,
        "type_json"               varchar(64)  NOT NULL,
        "name"                    varchar(128) NOT NULL,
        "unit"                    varchar(32)  NOT NULL,
        "number_of_decimal_cases" integer      NOT NULL DEFAULT 2,
        "factor"                  integer      NOT NULL DEFAULT 1,
        "offset"                  integer      NOT NULL DEFAULT 0,
        CONSTRAINT "pk_type_parameters"           PRIMARY KEY ("id"),
        CONSTRAINT "uq_type_parameters_type_json" UNIQUE ("type_json"),
        CONSTRAINT "uq_type_parameters_name"      UNIQUE ("name")
      )
    `);

    // ----------------------------------------------------------- parameters
    // Tabela que torna o modelo dinâmico: liga a estação às grandezas que ela mede.
    await queryRunner.query(`
      CREATE TABLE "parameters" (
        "id"                uuid   NOT NULL DEFAULT gen_random_uuid(),
        "id_station"        uuid   NOT NULL,
        "id_type_parameter" bigint NOT NULL,
        CONSTRAINT "pk_parameters"              PRIMARY KEY ("id"),
        CONSTRAINT "uq_parameters_station_type" UNIQUE ("id_station", "id_type_parameter"),
        CONSTRAINT "fk_parameters_station"      FOREIGN KEY ("id_station")
          REFERENCES "stations" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_parameters_type"         FOREIGN KEY ("id_type_parameter")
          REFERENCES "type_parameters" ("id") ON DELETE RESTRICT
      )
    `);

    // -------------------------------------------------------- emails_station
    await queryRunner.query(`
      CREATE TABLE "emails_station" (
        "id"         uuid         NOT NULL DEFAULT gen_random_uuid(),
        "email"      varchar(255) NOT NULL,
        "id_station" uuid         NOT NULL,
        CONSTRAINT "pk_emails_station"                 PRIMARY KEY ("id"),
        CONSTRAINT "uq_emails_station_station_email"   UNIQUE ("id_station", "email"),
        CONSTRAINT "fk_emails_station_station"         FOREIGN KEY ("id_station")
          REFERENCES "stations" ("id") ON DELETE CASCADE
      )
    `);

    // ------------------------------------------------------------- measures
    await queryRunner.query(`
      CREATE TABLE "measures" (
        "id"           uuid             NOT NULL DEFAULT gen_random_uuid(),
        "unix_time"    bigint           NOT NULL,
        "value"        double precision NOT NULL,
        "id_parameter" uuid             NOT NULL,
        CONSTRAINT "pk_measures"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_measures_parameter" FOREIGN KEY ("id_parameter")
          REFERENCES "parameters" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_measures_parameter_unix_time" ON "measures" ("id_parameter", "unix_time")`,
    );

    // ---------------------------------------------------------- type_alerts
    await queryRunner.query(`
      CREATE TABLE "type_alerts" (
        "id"                  uuid                  NOT NULL DEFAULT gen_random_uuid(),
        "name"                varchar(128)          NOT NULL,
        "value"               bigint                NOT NULL,
        "comparison_operator" "comparison_operator" NOT NULL,
        "id_parameter"        uuid                  NOT NULL,
        CONSTRAINT "pk_type_alerts"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_type_alerts_parameter" FOREIGN KEY ("id_parameter")
          REFERENCES "parameters" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_type_alerts_parameter" ON "type_alerts" ("id_parameter")`,
    );

    // --------------------------------------------------------------- alerts
    await queryRunner.query(`
      CREATE TABLE "alerts" (
        "id"            uuid        NOT NULL DEFAULT gen_random_uuid(),
        "id_measure"    uuid        NOT NULL,
        "id_type_alert" uuid        NOT NULL,
        "created_at"    timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_alerts"              PRIMARY KEY ("id"),
        CONSTRAINT "uq_alerts_measure_type" UNIQUE ("id_measure", "id_type_alert"),
        CONSTRAINT "fk_alerts_measure"      FOREIGN KEY ("id_measure")
          REFERENCES "measures" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_alerts_type_alert"   FOREIGN KEY ("id_type_alert")
          REFERENCES "type_alerts" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_alerts_created_at" ON "alerts" ("created_at")`);

    // ------------------------------------------------------ measures_average
    await queryRunner.query(`
      CREATE TABLE "measures_average" (
        "id"           uuid             NOT NULL DEFAULT gen_random_uuid(),
        "type_average" "average_type"   NOT NULL,
        "name"         varchar(128)     NOT NULL,
        "value"        double precision NOT NULL,
        "created_at"   timestamptz      NOT NULL DEFAULT now(),
        "id_station"   uuid             NOT NULL,
        CONSTRAINT "pk_measures_average"         PRIMARY KEY ("id"),
        CONSTRAINT "fk_measures_average_station" FOREIGN KEY ("id_station")
          REFERENCES "stations" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_measures_average_station_type_created"
        ON "measures_average" ("id_station", "type_average", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ordem inversa da criação, para não esbarrar nas foreign keys.
    await queryRunner.query(`DROP TABLE IF EXISTS "measures_average"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "type_alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "measures"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "emails_station"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "parameters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "type_parameters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "comparison_operator"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "average_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
