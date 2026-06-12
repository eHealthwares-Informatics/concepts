const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'coding-concepts.sqlite');
const MAP_PATH = '/tmp/lga_ward_map.json';

const STATE_ALIAS = {
  'Akwa Ibom': 'Akwa-Ibom',
  'Abuja FCT': 'FCT',
};

function normalizeState(name) {
  return STATE_ALIAS[name] || name;
}

function runAsync(db, sql, params) {
  return new Promise((res, rej) => {
    db.run(sql, params, function (err) { err ? rej(err) : res(this); });
  });
}

function allAsync(db, sql, params) {
  return new Promise((res, rej) => {
    db.all(sql, params, (err, rows) => err ? rej(err) : res(rows));
  });
}

async function main() {
  const mapping = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
  const db = new sqlite3.Database(DB_PATH);

  const stats = { states: 0, lgasUpdated: 0, wardsUpdated: 0, errors: [] };

  try {
    const facilityRows = await allAsync(db,
      `SELECT DISTINCT stateCode, lgaCode, wardCode FROM facilities WHERE stateCode IS NOT NULL ORDER BY stateCode, lgaCode, wardCode`
    );

    const lgaCodesPerState = {};
    for (const row of facilityRows) {
      if (row.lgaCode) {
        (lgaCodesPerState[row.stateCode] ??= new Set()).add(row.lgaCode);
      }
    }

    const stateNames = await allAsync(db,
      `SELECT code, name FROM concept_codes WHERE concept = 'STATE'`
    );
    const codeToStateName = Object.fromEntries(stateNames.map(r => [r.code, r.name]));

    for (const [stateCode, lgaCodes] of Object.entries(lgaCodesPerState)) {
      const stateName = codeToStateName[stateCode];
      if (!stateName) {
        stats.errors.push(`State code ${stateCode} not found`);
        continue;
      }

      const hdxKey = normalizeState(stateName);
      const hdxLgas = mapping.lgas[hdxKey];
      if (!hdxLgas) {
        stats.errors.push(`State "${stateName}" (${stateCode}) not in HDX`);
        continue;
      }

      const sortedLgaCodes = [...lgaCodes].sort((a, b) => parseInt(a) - parseInt(b));
      const sortedLgaNames = [...hdxLgas].sort();

      if (sortedLgaCodes.length !== sortedLgaNames.length) {
        stats.errors.push(`LGA count mismatch for ${stateName}: ${sortedLgaCodes.length} codes vs ${sortedLgaNames.length} names`);
      }

      const pairs = sortedLgaCodes.map((code, i) => ({
        code,
        name: i < sortedLgaNames.length ? sortedLgaNames[i] : code,
      }));

      for (const { code, name } of pairs) {
        await runAsync(db,
          `UPDATE concept_codes SET name = ? WHERE concept = 'LGA' AND code = ? AND (name IS NULL OR name = '' OR name = code)`,
          [name, code]
        );
      }
      stats.lgasUpdated += pairs.length;

      // Wards per LGA
      const wardCodesPerLga = {};
      for (const row of facilityRows) {
        if (row.stateCode === stateCode && row.wardCode && row.lgaCode) {
          (wardCodesPerLga[row.lgaCode] ??= new Set()).add(row.wardCode);
        }
      }

      for (const [lgaCode, wardCodes] of Object.entries(wardCodesPerLga)) {
        const lgaPair = pairs.find(p => p.code === lgaCode);
        const lgaName = lgaPair ? lgaPair.name : lgaCode;

        const hdxWards = mapping.wards[hdxKey]?.[lgaName];
        if (!hdxWards) {
          stats.errors.push(`No HDX wards for ${stateName}/${lgaName} (${lgaCode})`);
          continue;
        }

        const sortedWardCodes = [...wardCodes].sort((a, b) => parseInt(a) - parseInt(b));
        const sortedWardNames = [...hdxWards].sort();

        if (sortedWardCodes.length !== sortedWardNames.length) {
          stats.errors.push(`Ward count mismatch for ${stateName}/${lgaName}: ${sortedWardCodes.length} codes vs ${sortedWardNames.length} names`);
        }

        const wPairs = sortedWardCodes.map((code, i) => ({
          code,
          name: i < sortedWardNames.length ? sortedWardNames[i] : code,
        }));

        for (const { code, name } of wPairs) {
          await runAsync(db,
            `UPDATE concept_codes SET name = ? WHERE concept = 'WARD' AND code = ? AND (name IS NULL OR name = '' OR name = code)`,
            [name, code]
          );
        }
        stats.wardsUpdated += wPairs.length;
      }

      stats.states++;
    }

    console.log('\n=== NAME POPULATION RESULT ===');
    console.log(`States processed: ${stats.states}`);
    console.log(`LGAs updated: ${stats.lgasUpdated}`);
    console.log(`Wards updated: ${stats.wardsUpdated}`);
    if (stats.errors.length > 0) {
      console.log(`Errors (${stats.errors.length}):`);
      for (const err of stats.errors.slice(0, 30)) {
        console.log(`  - ${err}`);
      }
    }

  } catch (err) {
    console.error('Fatal:', err);
  } finally {
    db.close();
  }
}

main();
