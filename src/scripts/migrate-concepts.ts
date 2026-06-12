import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ExternalConceptMappingEntity,
  ImportTrackingEntity,
} from '../modules/concepts/entities';
import { CodingConcept } from '../common/enums/concept.enum';
import {
  StateEntity,
  LgaEntity,
  WardEntity,
  FacilityTypeEntity,
  FacilityLevelEntity,
  FacilityEntity,
} from '../modules/facilities/entities';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function migrate() {
  loadEnv();

  const dbType = (process.env.DB_TYPE || 'sqlite') as 'sqlite' | 'postgres';
  const ds = new DataSource({
    type: dbType,
    database: process.env.DB_NAME || 'coding-concepts.sqlite',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    entities: [
      ConceptCodingEntity,
      ConceptAttributeEntity,
      ConceptAttributeValueEntity,
      ExternalConceptMappingEntity,
      ImportTrackingEntity,
      FacilityEntity,
      StateEntity,
      LgaEntity,
      WardEntity,
      FacilityTypeEntity,
      FacilityLevelEntity,
    ],
    synchronize: false,
  });

  await ds.initialize();
  console.log('Connected to database');

  const conceptCodeRepo = ds.getRepository(ConceptCodingEntity);
  const facilityRepo = ds.getRepository(FacilityEntity);

  const migrationMap: { concept: CodingConcept; repo: any }[] = [
    { concept: CodingConcept.STATE, repo: ds.getRepository(StateEntity) },
    { concept: CodingConcept.LGA, repo: ds.getRepository(LgaEntity) },
    { concept: CodingConcept.WARD, repo: ds.getRepository(WardEntity) },
    { concept: CodingConcept.FACILITY_TYPE, repo: ds.getRepository(FacilityTypeEntity) },
    { concept: CodingConcept.FACILITY_LEVEL, repo: ds.getRepository(FacilityLevelEntity) },
  ];

  for (const { concept, repo } of migrationMap) {
    const rows = await conceptCodeRepo.find({
      where: { concept },
      select: ['code', 'name'],
    });
    if (!rows.length) {
      console.log(`${concept}: 0 rows (skipping)`);
      continue;
    }

    let inserted = 0;
    for (const row of rows) {
      if (!row.code) continue;
      const existing = await repo.findOne({ where: { code: row.code } });
      if (!existing) {
        await repo.save(repo.create({ code: row.code, name: row.name || '' }));
        inserted++;
      }
    }
    console.log(`${concept}: ${inserted} new, ${rows.length} total`);
  }

  const totalFacilities = await facilityRepo.count();
  console.log(`\nFacilities: ${totalFacilities} total`);
  console.log('NOTE: Old stateCode/lgaCode/wardCode columns were dropped during schema sync.');
  console.log('Facility FK values cannot be recovered from ConceptCodingEntity alone.');
  console.log('To populate facility FKs, re-run the seeder:');
  console.log('  npm run seed:facility\n');

  await ds.destroy();
  console.log('Migration complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
