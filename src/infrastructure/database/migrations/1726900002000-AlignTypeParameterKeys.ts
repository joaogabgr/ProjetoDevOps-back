import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Alinha o catálogo de parâmetros com as chaves que as placas das estações enviam
 * no JSON do MQTT (RF3) e inclui o nível do rio, que faltava na carga inicial.
 */
export class AlignTypeParameterKeys1726900002000 implements MigrationInterface {
  name = 'AlignTypeParameterKeys1726900002000';

  private readonly renames = [
    { from: 'hum', to: 'umid' },
    { from: 'pres', to: 'pressao' },
    { from: 'rain', to: 'chuva' },
    { from: 'wind_speed', to: 'vento_vel' },
    { from: 'wind_dir', to: 'vento_dir' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { from, to } of this.renames) {
      await queryRunner.query(`UPDATE "type_parameters" SET "type_json" = $2 WHERE "type_json" = $1`, [from, to]);
    }

    await queryRunner.query(
      `INSERT INTO "type_parameters"
         ("type_json", "name", "unit", "number_of_decimal_cases", "factor", "offset")
       VALUES ('nivel', 'Nível do Rio', 'cm', 1, 1, 0)
       ON CONFLICT ("type_json") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "type_parameters" WHERE "type_json" = 'nivel'`);

    for (const { from, to } of this.renames) {
      await queryRunner.query(`UPDATE "type_parameters" SET "type_json" = $2 WHERE "type_json" = $1`, [to, from]);
    }
  }
}
