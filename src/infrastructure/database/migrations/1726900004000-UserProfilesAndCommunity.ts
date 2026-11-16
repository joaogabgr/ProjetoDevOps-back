import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Perfis do RF5 (Técnico de campo e Agente comunitário no lugar de EMPLOYEE e PUBLIC)
 * e a comunidade do usuário, obrigatória para o Agente comunitário.
 */
export class UserProfilesAndCommunity1726900004000 implements MigrationInterface {
  name = 'UserProfilesAndCommunity1726900004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "user_role" RENAME VALUE 'EMPLOYEE' TO 'TECHNICIAN'`);
    await queryRunner.query(`ALTER TYPE "user_role" RENAME VALUE 'PUBLIC' TO 'COMMUNITY_AGENT'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "community" varchar(120) NULL`);
    await queryRunner.query(
      `UPDATE "users" SET "community" = 'Não informada' WHERE "role" = 'COMMUNITY_AGENT' AND "community" IS NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "chk_users_agent_community"
        CHECK ("role" <> 'COMMUNITY_AGENT' OR "community" IS NOT NULL)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "chk_users_agent_community"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "community"`);
    await queryRunner.query(`ALTER TYPE "user_role" RENAME VALUE 'COMMUNITY_AGENT' TO 'PUBLIC'`);
    await queryRunner.query(`ALTER TYPE "user_role" RENAME VALUE 'TECHNICIAN' TO 'EMPLOYEE'`);
  }
}
