import 'dotenv/config';
import { DataSource, type DataSourceOptions } from 'typeorm';

const dbType = process.env.DB_TYPE ?? 'sqlite';
const options: DataSourceOptions = dbType === 'postgres'
  ? {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'coding-concepts',
      synchronize: false,
    }
  : {
      type: 'sqlite',
      database: process.env.DB_NAME ?? 'coding-concepts.sqlite',
      synchronize: false,
    };

const dataSource = new DataSource(options);
const fieldMap = [
  ['general_use', 'general_drug_use'],
  ['adult_dosage', 'dosage'],
  ['pediatric_dosage', 'dose_per_age_range'],
  ['appendix_dosages', 'appendix_dosages'],
] as const;

function valueOf(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

async function main(): Promise<void> {
  await dataSource.initialize();
  const runner = dataSource.createQueryRunner();
  await runner.connect();
  try {
    if (!(await runner.hasTable('generic_products')) || !(await runner.hasTable('pharmaceutics'))) {
      throw new Error('Expected generic_products and pharmaceutics tables.');
    }
    if (!(await runner.hasColumn('pharmaceutics', 'appendix_dosages'))) {
      await runner.query('ALTER TABLE pharmaceutics ADD COLUMN appendix_dosages TEXT NULL');
    }

    const sourceColumns = (await Promise.all(fieldMap.map(async ([source]) =>
      (await runner.hasColumn('generic_products', source)) ? source : null,
    ))).filter((column): column is Exclude<typeof column, null> => column !== null);
    const hasControlled = await runner.hasColumn('generic_products', 'is_controlled_substance');
    if (!sourceColumns.length && !hasControlled) {
      console.log('No legacy GenericProduct monograph columns found; nothing to migrate.');
      return;
    }
    const unlinkedPredicates = [
      ...sourceColumns.map((column) => `TRIM(COALESCE(${column}, '')) <> ''`),
      ...(hasControlled ? ['is_controlled_substance = TRUE'] : []),
    ];
    if (unlinkedPredicates.length) {
      const unlinked = await runner.query(
        `SELECT COUNT(*) AS count FROM generic_products WHERE pharmaceutics_id IS NULL AND (${unlinkedPredicates.join(' OR ')})`,
      ) as Array<{ count: string | number }>;
      if (Number(unlinked[0]?.count ?? 0) > 0) {
        throw new Error(`Migration stopped: ${unlinked[0].count} unlinked GenericProduct rows contain monograph data that cannot be transferred.`);
      }
    }

    const selections = [
      'gp.pharmaceutics_id AS pharmaceutics_id',
      ...sourceColumns.map((column) => `gp.${column} AS ${column}`),
      ...(hasControlled ? ['gp.is_controlled_substance AS is_controlled_substance'] : []),
      'p.general_drug_use AS target_general_drug_use',
      'p.dosage AS target_dosage',
      'p.dose_per_age_range AS target_dose_per_age_range',
      'p.appendix_dosages AS target_appendix_dosages',
      'p.is_controlled_substance AS target_is_controlled_substance',
    ];
    const rows = await runner.query(
      `SELECT ${selections.join(', ')} FROM generic_products gp JOIN pharmaceutics p ON p.id = gp.pharmaceutics_id`,
    ) as Record<string, unknown>[];

    const valuesByMonograph = new Map<string, Record<string, string | boolean>>();
    const conflicts: string[] = [];
    for (const row of rows) {
      const id = String(row.pharmaceutics_id);
      const values = valuesByMonograph.get(id) ?? {};
      for (const [source, target] of fieldMap) {
        if (!sourceColumns.includes(source)) continue;
        const value = valueOf(row[source]);
        if (!value) continue;
        const targetValue = valueOf(row[`target_${target}`]);
        const previous = values[target];
        if (previous && previous !== value) conflicts.push(`${id}.${target}: multiple GP values`);
        else if (targetValue && targetValue !== value) conflicts.push(`${id}.${target}: GP value conflicts with Pharmaceutics value`);
        else if (!targetValue) values[target] = value;
      }
      if (hasControlled && String(row.is_controlled_substance).toLowerCase() === 'true') {
        values.is_controlled_substance = true;
      }
      valuesByMonograph.set(id, values);
    }
    if (conflicts.length) {
      throw new Error(`Migration stopped before updates; resolve field conflicts first:\n${[...new Set(conflicts)].slice(0, 30).join('\n')}`);
    }

    await runner.startTransaction();
    try {
      for (const [id, values] of valuesByMonograph) {
        const entries = Object.entries(values);
        if (!entries.length) continue;
        const assignments = entries.map(([column], index) => `${column} = ${dbType === 'postgres' ? `$${index + 1}` : '?'}`);
        const params = entries.map(([, value]) => value);
        params.push(id);
        const idParameter = dbType === 'postgres' ? `$${params.length}` : '?';
        await runner.query(`UPDATE pharmaceutics SET ${assignments.join(', ')} WHERE id = ${idParameter}`, params);
      }
      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    }
    console.log(`Migrated monograph fields to Pharmaceutics for ${valuesByMonograph.size} linked records.`);
    console.log('Back up the database, then start the updated concepts service so TypeORM can remove the obsolete GP columns.');
  } finally {
    await runner.release();
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
