/* Probe: how do Adamawa facilities look in the DB vs the reconciled CSVs?
 * 1. DB: what state do the Adamawa-sourced rows carry? What raw state_name did they have?
 * 2. CSV: does the reconciler output include Adamawa facilities with codes?
 * 3. names file: what unique_id SS prefix does Adamawa use, and does a code file exist?
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();

const BASE = '/Users/john/develop/rxsoft/seed/seeds/concepts/csv/facilities';

async function main() {
  // ---- 1. DB state ----
  const c = new Client({
    host: get('DB_HOST'),
    port: Number(get('DB_PORT')),
    user: get('DB_USER'),
    password: get('DB_PASSWORD'),
    database: get('DB_NAME'),
  });
  await c.connect();

  const states = await c.query(`SELECT code, name FROM states ORDER BY code`);
  console.log('== states in DB ==');
  states.rows.forEach((r) => console.log(`  ${r.code} = ${r.name}`));

  const adamawa = await c.query(`SELECT id, code, name FROM states WHERE name ILIKE '%adamawa%'`);
  console.log('\nAdamawa state row:', adamawa.rows[0] || 'NONE');

  if (adamawa.rows[0]) {
    const cnt = await c.query(
      `SELECT COUNT(*)::int AS n FROM facilities WHERE state_id = $1`,
      [adamawa.rows[0].id],
    );
    console.log('Facilities pointing at Adamawa state_id:', cnt.rows[0].n);
  }

  // raw state info stored on facilities rows? check columns
  const cols = await c.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'facilities' ORDER BY ordinal_position`);
  console.log('\nfacilities columns:', cols.rows.map((r) => r.column_name).join(', '));

  await c.end();

  // ---- 2. Reconciled CSV output ----
  const outDir = path.join(BASE, 'reconciled_output');
  if (fs.existsSync(path.join(outDir, 'states.csv'))) {
    const stCsv = fs.readFileSync(path.join(outDir, 'states.csv'), 'utf8').trim().split('\n');
    console.log('\n== reconciled_output/states.csv ==');
    console.log(stCsv.join('\n'));

    const facCsv = fs.readFileSync(path.join(outDir, 'facilities.csv'), 'utf8').trim().split('\n');
    const header = facCsv[0].split(',');
    const scIdx = header.indexOf('state_code');
    const bySc = {};
    for (let i = 1; i < facCsv.length; i++) {
      const sc = facCsv[i].split(',')[scIdx];
      bySc[sc] = (bySc[sc] || 0) + 1;
    }
    console.log('\n== facilities.csv rows by state_code ==');
    Object.entries(bySc).sort().forEach(([sc, n]) => console.log(`  ${sc}: ${n}`));
  } else {
    console.log('\n(no reconciled_output/states.csv)');
  }

  // ---- 3. Names file: Adamawa rows & SS prefix ----
  const namesPath = path.join(BASE, 'facilities_by_administrative_names', 'facilities_with_administrative_names.csv');
  if (fs.existsSync(namesPath)) {
    const lines = fs.readFileSync(namesPath, 'utf8').split('\n');
    const hdr = lines[0].split(',').map((h) => h.trim());
    const uidI = hdr.indexOf('unique_id');
    const stI = hdr.indexOf('state_name');
    const counts = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      // naive CSV split (values may contain commas in quotes; good enough for state_name histogram)
      const m = line.match(/^"?(\d{2})\//); // unique_id SS prefix
      const ss = m ? m[1] : null;
      counts[ss] = counts[ss] || { n: 0, sample: null };
      counts[ss].n++;
      if (!counts[ss].sample) {
        const cells = line.split(',').map((x) => x.replace(/^"|"$/g, '').trim());
        counts[ss].sample = `uid=${cells[uidI]} state=${cells[stI]}`;
      }
    }
    console.log('\n== names file: unique_id SS prefix histogram ==');
    Object.entries(counts).sort().forEach(([ss, v]) => console.log(`  SS=${ss}: ${v.n}  e.g. ${v.sample}`));
  }

  // ---- 4. code files present? ----
  const codeDir = path.join(BASE, 'facilities_by_administrative_code');
  if (fs.existsSync(codeDir)) {
    console.log('\n== code files ==');
    console.log(fs.readdirSync(codeDir).filter((f) => f.endsWith('.csv')).join('\n'));
  }
}

main().catch((e) => {
  console.error('PROBE FAILED:', e.message);
  process.exit(1);
});
