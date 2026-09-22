/* Throwaway probe: validate legacy FCT LGA codes (1276-81) against the
 * reconciled 137xx LGAs via phone/coord twins, and check what else
 * references the legacy LGA/ward rows. */
const { Client } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const c = new Client({
  host: get('DB_HOST'), port: +get('DB_PORT'), user: get('DB_USER'),
  password: get('DB_PASSWORD'), database: get('DB_NAME'),
});

// Hypothesis: legacy codes are alphabetical over the same six LGAs
// (Abaji, AMAC, Bwari, Gwagwalada, Kuje, Kwali).
const LEGACY_TO_RECONCILED = {
  1276: '13701', 1277: '13702', 1278: '13703',
  1279: '13704', 1280: '13705', 1281: '13706',
};

async function main() {
  await c.connect();
  const q = async (sql, label) => {
    const r = await c.query(sql);
    console.log(label, JSON.stringify(r.rows, null, 1));
    return r.rows;
  };

  // Twin agreement: for phone-matched orphan/twin pairs, does the twin's
  // reconciled LGA equal our mapping of the orphan's legacy LGA?
  const rows = await q(`
    SELECT ol.code AS legacy_lga, tl.code AS twin_lga, tl.name AS twin_name, count(*)::int AS n
    FROM facilities o
    JOIN lgas ol ON ol.id = o.lga_id
    JOIN facilities t ON t."phoneNumber" = o."phoneNumber"
    JOIN lgas tl ON tl.id = t.lga_id
    WHERE o.state_id IS NULL AND o."phoneNumber" IS NOT NULL AND tl.code LIKE '137%'
    GROUP BY ol.code, tl.code, tl.name
    ORDER BY ol.code, n DESC
  `, 'twin LGA agreement (legacy -> reconciled):');

  console.log('\n-- mapping hypothesis check --');
  let bad = 0;
  for (const r of rows) {
    const expected = LEGACY_TO_RECONCILED[r.legacy_lga];
    const ok = expected === r.twin_lga;
    if (!ok) bad += r.n;
    console.log(`${r.legacy_lga} -> twin ${r.twin_lga} (${r.twin_name}) x${r.n} ${ok ? 'OK' : '** MISMATCH **'}`);
  }
  console.log(bad === 0 ? 'ALL AGREEMENT — alphabetical mapping validated' : `MISMATCHES: ${bad}`);

  // Coord twins as an independent check
  await q(`
    SELECT ol.code AS legacy_lga, tl.code AS twin_lga, count(*)::int AS n
    FROM facilities o
    JOIN lgas ol ON ol.id = o.lga_id
    JOIN facilities t ON t.latitude = o.latitude AND t.longitude = o.longitude
    JOIN lgas tl ON tl.id = t.lga_id
    WHERE o.state_id IS NULL AND tl.code LIKE '137%'
    GROUP BY ol.code, tl.code ORDER BY ol.code, n DESC
  `, 'coord-twin agreement:');

  // Who else references the legacy LGA / ward rows?
  await q(`
    SELECT 'pharmacies->legacy lga' AS ref, count(*)::int AS n FROM pharmacies p JOIN lgas l ON l.id = p.lga_id WHERE l.code IN ('1276','1277','1278','1279','1280','1281')
    UNION ALL
    SELECT 'pharmacies->legacy ward', count(*)::int FROM pharmacies p JOIN wards w ON w.id = p.ward_id WHERE w.code LIKE '134%' OR w.code LIKE '135%'
    UNION ALL
    SELECT 'localities->legacy lga', count(*)::int FROM locality_admins la JOIN lgas l ON l.id = la.lga_id WHERE l.code IN ('1276','1277','1278','1279','1280','1281')
    UNION ALL
    SELECT 'concept_codes->orphan facility', count(*)::int FROM concept_codes cc JOIN facilities f ON f."facilityId" = cc.code WHERE f.state_id IS NULL
  `, 'external references to legacy rows:');

  // Ward distribution of orphans per legacy LGA (sanity: wards nest under their LGA)
  await q(`
    SELECT l.code AS legacy_lga, count(DISTINCT f.ward_id)::int AS wards, count(*)::int AS facs
    FROM facilities f JOIN lgas l ON l.id = f.lga_id
    WHERE f.state_id IS NULL GROUP BY l.code ORDER BY l.code
  `, 'orphans per legacy LGA:');

  console.log('done');
  await c.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
