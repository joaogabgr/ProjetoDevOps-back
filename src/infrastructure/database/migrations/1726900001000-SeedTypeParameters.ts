import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Catálogo inicial de grandezas medidas pelas estações.
 *
 * Vai como migration, e não como script de seed, porque estes registros são
 * referenciados pelo cadastro de estação: sem eles a API sobe sem nada para oferecer.
 */
export class SeedTypeParameters1726900001000 implements MigrationInterface {
  name = 'SeedTypeParameters1726900001000';

  private readonly types = [
    { typeJson: 'temp', name: 'Temperatura', unit: '°C', decimals: 1 },
    { typeJson: 'hum', name: 'Umidade Relativa', unit: '%', decimals: 1 },
    { typeJson: 'pres', name: 'Pressão Atmosférica', unit: 'hPa', decimals: 1 },
    { typeJson: 'wind_speed', name: 'Velocidade do Vento', unit: 'm/s', decimals: 2 },
    { typeJson: 'wind_dir', name: 'Direção do Vento', unit: '°', decimals: 0 },
    { typeJson: 'rain', name: 'Índice Pluviométrico', unit: 'mm', decimals: 2 },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const type of this.types) {
      await queryRunner.query(
        `INSERT INTO "type_parameters"
           ("type_json", "name", "unit", "number_of_decimal_cases", "factor", "offset")
         VALUES ($1, $2, $3, $4, 1, 0)
         ON CONFLICT ("type_json") DO NOTHING`,
        [type.typeJson, type.name, type.unit, type.decimals],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "type_parameters" WHERE "type_json" = ANY($1)`, [
      this.types.map((type) => type.typeJson),
    ]);
  }
}
