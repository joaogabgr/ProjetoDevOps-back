import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { schemas } from './src/infrastructure/database/schemas';

async function main() {
  const ds = new DataSource({
    type: 'postgres', host: 'localhost', port: 5432,
    username: 'x', password: 'x', database: 'x',
    entities: schemas, synchronize: false,
  });
  await (ds as any).buildMetadatas();
  for (const meta of ds.entityMetadatas) {
    console.log(`\n== ${meta.name} (${meta.tableName})`);
    console.log('   cols:', meta.columns.map(c => `${c.propertyName}->${c.databaseName}`).join(', '));
    const rels = meta.relations.map(r => `${r.propertyName}:${r.relationType}->${r.inverseEntityMetadata.name}`);
    if (rels.length) console.log('   rels:', rels.join(' | '));
  }
  console.log('\nOK:', ds.entityMetadatas.length, 'entidades');
}
main().catch(e => { console.error('FALHOU:', e.message); process.exit(1); });
