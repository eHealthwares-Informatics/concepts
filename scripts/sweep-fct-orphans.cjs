/* Sweep the FCT legacy-code orphans (v2 — client-side matching).
 *
 * State found during diagnosis:
 *  - 1,322 facilities have state_id IS NULL. All point at six legacy LGA rows
 *    (1276..1281, name = code, stateCode NULL) from the raw fct.csv import —
 *    a pre-reconciler snapshot of the FCT registry.
 *  - The rows are nameless shells (no facilityName/uniqueId) duplicated ~2x by
 *    re-import; 1,256 of them match a reconciled FCT facility (lga 13701-13706)
 *    by phone number, with 100% legacy->reconciled LGA agreement.
 *  - Legacy codes are alphabetical over the six FCT LGAs:
 *      1276 Abaji 1277 AMAC 1278 Bwari 1279 Gwagwalada 1280 Kuje 1281 Kwali
 *
 * v1 stalled: a server-side DELETE ... EXISTS join on this 97k-row, mostly
 * unindexed table ran for minutes (and the in-transaction helper indexes were
 * rolled back every time the stalled run was killed). v2 therefore fetches the
 * small ID/phone sets and matches them in Node, then writes by primary key.
 *
 * Actions (single write transaction, reversible via *_backup tables):
 *  1. Back up all 1,322 orphan rows + the six legacy LGA rows.
 *  2. Delete orphans whose phone matches a reconciled FCT facility.
 *  3. Repoint surviving orphans onto the FCT state + reconciled LGA.
 *  4. Delete the six legacy LGA rows once nothing references them.
 */
const { Client } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();

const LEGACY = ['1276', '1277', '1278', '1279', '1280', '1281'];
const LEGACY_TO_RECONCILED = {
  1276: '13701', 1277: '13702', 1278: '13703',
  1279: '13704', 1280: '13705', 1281: '13706',
};

const c = new Client({
  host: get('DB_HOST'), port: +get('DB_PORT'), user: get('DB_USER'),
  password: get('DB_PASSWORD'), database: get('DB_NAME'),
});

async function main() {
  await c.connect();

  // ---------- read phase (no transaction needed) ----------
  const orphans = (await c.query(`
    SELECT id, "facilityId", "phoneNumber", lga_id
    FROM facilities WHERE state_id IS NULL
  `)).rows;
  console.log(`orphans: ${orphans.length}`);

  const twins = (await c.query(`
    SELECT DISTINCT f."phoneNumber" AS p
    FROM facilities f JOIN lgas l ON l.id = f.lga_id
    WHERE l.code LIKE '137%' AND f."phoneNumber" IS NOT NULL
  `)).rows.map((r) => r.p);
  const twinSet = new Set(twins);
  console.log(`reconciled FCT distinct phones: ${twinSet.size}`);

  const dupIds = orphans.filter((o) => o.phoneNumber && twinSet.has(o.phoneNumber)).map((o) => o.id);
  const survivors = orphans.filter((o) => !dupIds.includes(o.id));
  console.log(`phone-twin duplicates to delete: ${dupIds.length}`);
  console.log(`survivors to repair: ${survivors.length}`);

  const fctState = (await c.query(`SELECT id, code, name FROM states WHERE code = '137'`)).rows[0];
  if (!fctState) throw new Error('FCT state 137 not found');
  const legacyLgaRows = (await c.query(`SELECT id, code FROM lgas WHERE code = ANY($1)`, [LEGACY])).rows;
  const legacyToLgaId = Object.fromEntries(legacyLgaRows.map((r) => [r.code, r.id]));
  const reconRows = (await c.query(`SELECT id, code, name FROM lgas WHERE code = ANY($1)`, [Object.values(LEGACY_TO_RECONCILED)])).rows;
  const reconByCode = Object.fromEntries(reconRows.map((r) => [r.code, r]));
  console.log(`FCT state: ${fctState.name}; legacy LGAs: ${legacyLgaRows.length}; reconciled LGAs: ${reconRows.length}`);
  if (legacyLgaRows.length !== 6 || reconRows.length !== 6) throw new Error('unexpected LGA row counts');

  // Per-survivor target LGA from the validated alphabetical legacy map.
  const lgaIdToCode = Object.fromEntries(legacyLgaRows.map((r) => [r.id, r.code]));
  const repairs = survivors.map((o) => {
    const legacyCode = lgaIdToCode[o.lga_id];
    const recon = reconByCode[LEGACY_TO_RECONCILED[legacyCode]];
    if (!recon) throw new Error(`no reconciled LGA for legacy ${legacyCode} (facility ${o.facilityId})`);
    return { id: o.id, lgaId: recon.id, lgaCode: recon.code };
  });

  // ---------- write phase ----------
  // Helper indexes committed OUTSIDE the transaction so kills can't roll them
  // back (v1 recreated them inside the txn and lost them on every kill).
  await c.query(`CREATE INDEX IF NOT EXISTS idx_facilities_state_id ON facilities (state_id)`);
  await c.query(`ANALYZE facilities`);

  await c.query('BEGIN');
  try {
    // 1. Backups (IF NOT EXISTS so re-runs keep the first, fullest snapshot).
    await c.query(`
      CREATE TABLE IF NOT EXISTS facilities_fct_orphan_backup AS
      SELECT f.*, now() AS backed_up_at FROM facilities f WHERE false
    `);
    const backedUp = Number((await c.query(`SELECT count(*)::int AS n FROM facilities_fct_orphan_backup`)).rows[0].n);
    if (backedUp === 0) {
      await c.query(`INSERT INTO facilities_fct_orphan_backup SELECT f.*, now() FROM facilities f WHERE f.state_id IS NULL`);
      console.log(`backed up ${orphans.length} orphan rows`);
    } else {
      console.log(`backup already holds ${backedUp} rows — not overwriting`);
    }

    await c.query(`
      CREATE TABLE IF NOT EXISTS lgas_fct_legacy_backup AS
      SELECT l.*, now() AS backed_up_at FROM lgas l WHERE false
    `);
    if (Number((await c.query(`SELECT count(*)::int AS n FROM lgas_fct_legacy_backup`)).rows[0].n) === 0) {
      await c.query(`INSERT INTO lgas_fct_legacy_backup SELECT l.*, now() FROM lgas l WHERE code = ANY($1)`, [LEGACY]);
    }

    // 2. Dedupe by primary key.
    if (dupIds.length) {
      const del = await c.query(`DELETE FROM facilities WHERE id = ANY($1) RETURNING id`, [dupIds]);
      console.log(`deleted ${del.rowCount} duplicate orphan shells`);
    }

    // 3. Repair survivors by primary key (chunked CASE-free updates).
    let repaired = 0;
    for (let i = 0; i < repairs.length; i += 200) {
      const chunk = repairs.slice(i, i + 200);
      const ids = chunk.map((r) => r.id);
      const lgaIds = chunk.map((r) => r.lgaId);
      const res = await c.query(`
        UPDATE facilities f
        SET state_id = $1, lga_id = u.lga_id
        FROM (SELECT unnest($2::uuid[]) AS id, unnest($3::uuid[]) AS lga_id) u
        WHERE f.id = u.id
      `, [fctState.id, ids, lgaIds]);
      repaired += res.rowCount;
    }
    console.log(`repaired ${repaired}/${survivors.length} survivors onto FCT + reconciled LGAs`);

    const leftNull = Number((await c.query(`SELECT count(*)::int AS n FROM facilities WHERE state_id IS NULL`)).rows[0].n);
    if (leftNull !== 0) throw new Error(`${leftNull} facilities still have state_id NULL after repair`);

    // 4. Retire the legacy LGA rows only if nothing references them anymore.
    const facUsed = Number((await c.query(`SELECT count(*)::int AS n FROM facilities f JOIN lgas l ON l.id = f.lga_id WHERE l.code = ANY($1)`, [LEGACY])).rows[0].n);
    const pharmUsed = Number((await c.query(`SELECT count(*)::int AS n FROM pharmacies p JOIN lgas l ON l.id = p.lga_id WHERE l.code = ANY($1)`, [LEGACY])).rows[0].n);
    if (facUsed === 0 && pharmUsed === 0) {
      const del = await c.query(`DELETE FROM lgas WHERE code = ANY($1) RETURNING code`, [LEGACY]);
      console.log(`retired legacy LGA rows: ${del.rows.map((r) => r.code).join(', ')}`);
    } else {
      console.log(`legacy LGAs still referenced (facilities=${facUsed}, pharmacies=${pharmUsed}) — left in place`);
    }

    await c.query('COMMIT');
    console.log('committed');
  } catch (err) {
    await c.query('ROLLBACK');
    throw err;
  }

  // Post-sweep census
  const fct = await c.query(`
    SELECT l.code, l.name, count(f.id)::int AS n
    FROM lgas l LEFT JOIN facilities f ON f.lga_id = l.id
    WHERE l.code LIKE '137%' GROUP BY l.code, l.name ORDER BY l.code
  `);
  const fctTotal = (await c.query(`SELECT count(*)::int AS n FROM facilities f JOIN states s ON s.id = f.state_id WHERE s.code = '137'`)).rows[0].n;
  const total = (await c.query(`SELECT count(*)::int AS n FROM facilities`)).rows[0].n;
  const nullState = (await c.query(`SELECT count(*)::int AS n FROM facilities WHERE state_id IS NULL`)).rows[0].n;
  console.log('\n=== post-sweep FCT census ===');
  for (const r of fct.rows) console.log(`  ${r.code} ${r.name}: ${r.n}`);
  console.log(`FCT total: ${fctTotal} | all facilities: ${total} | state_id NULL: ${nullState}`);

  await c.end();
}

main().catch(async (e) => { console.error(e); try { await c.end(); } catch {} process.exit(1); });
