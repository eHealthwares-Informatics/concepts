const {GoogleAuth} = require('google-auth-library');
const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SHEET_ID = process.env.FACILITY_SHEET_ID;
const MAP_PATH = '/tmp/lga_ward_map.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const STATE_ALIAS = { 'Akwa-Ibom': 'Akwa Ibom', 'FCT': 'Abuja FCT' };

async function getToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  return (await client.getAccessToken()).token;
}

function fetch(url, token) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { Authorization: 'Bearer ' + token } }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { const p = JSON.parse(d); if (p.error) rej(new Error(p.error.message)); else res(p); });
    }).on('error', rej);
  });
}

function put(url, token, body) {
  return new Promise((res, rej) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method: 'PUT',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data) } };
    const req = https.request(opts, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { const p = JSON.parse(d); if (p.error) rej(new Error(p.error.message)); else res(p); });
    });
    req.on('error', rej); req.write(data); req.end();
  });
}

function clear(range, token) {
  return new Promise((res, rej) => {
    const data = '{}';
    const u = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:clear`);
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data) } };
    const req = https.request(opts, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { const p = JSON.parse(d); if (p.error) rej(new Error(p.error.message)); else res(p); });
    });
    req.on('error', rej); req.write(data); req.end();
  });
}

async function main() {
  const token = await getToken();
  const mapping = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));

  // 1. Get all sheet names
  const meta = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`, token);
  const allSheets = meta.sheets.map(s => s.properties.title);
  const facilitySheets = allSheets.filter(n => n.startsWith('facility_'));
  const refSheets = allSheets.filter(n => ['state','lga','ward','facility_type','facility_level'].includes(n));
  console.log(`Found ${facilitySheets.length} facility sheets, ${refSheets.length} ref sheets`);

  // 2. Load state sheet for code→name
  const stateData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/state`, token);
  const sH = (stateData.values || [])[0] || [];
  const stateNameByCode = {};
  for (const row of (stateData.values || []).slice(1)) {
    const r = Object.fromEntries(sH.map((h, i) => [h, (row[i] || '').trim()]));
    if (r.code && r.name) stateNameByCode[r.code] = r.name;
  }
  console.log(`Loaded ${Object.keys(stateNameByCode).length} states`);

  // 3. Extract (state_code, lga_code, ward_code) from ALL facility sheets
  const lgaPairsByState = {};   // state_code → Set of lga_code strings
  const wardTriplesByState = {}; // state_code → { lga_code → Set of ward_code strings }
  for (const sheetName of facilitySheets) {
    const data = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}`, token);
    const headers = (data.values || [])[0] || [];
    const rows = (data.values || []).slice(1);
    for (const row of rows) {
      const r = {};
      headers.forEach((h, i) => { r[h] = (row[i] || '').trim(); });
      if (r.state_code && r.lga_code) {
        (lgaPairsByState[r.state_code] ??= new Set()).add(r.lga_code);
        if (r.ward_code) {
          (wardTriplesByState[r.state_code] ??= {}); 
          (wardTriplesByState[r.state_code][r.lga_code] ??= new Set()).add(r.ward_code);
        }
      }
    }
  }
  console.log(`Extracted LGA pairs from ${Object.keys(lgaPairsByState).length} states`);

  // 4. Build (state_code, lga_code) → lga_name mapping using HDX
  const pairToLgaName = {};
  for (const [sc, codeSet] of Object.entries(lgaPairsByState)) {
    const stateName = stateNameByCode[sc];
    if (!stateName) continue;
    let hdxKey = stateName;
    for (const [h, d] of Object.entries(STATE_ALIAS)) { if (d === hdxKey) { hdxKey = h; break; } }
    const hdxLgas = mapping.lgas[hdxKey];
    if (!hdxLgas) continue;
    const sorted = [...codeSet].sort((a, b) => parseInt(a) - parseInt(b));
    const names = [...hdxLgas].sort();
    sorted.forEach((code, i) => {
      pairToLgaName[sc + ':' + code] = i < names.length ? names[i] : code;
    });
  }
  console.log(`Built ${Object.keys(pairToLgaName).length} (state:lga)→name mappings`);

  // 5. Build (state_code, lga_code, ward_code) → ward_name mapping
  const tripleToWardName = {};
  for (const [sc, lgas] of Object.entries(wardTriplesByState)) {
    const stateName = stateNameByCode[sc];
    if (!stateName) continue;
    let hdxKey = stateName;
    for (const [h, d] of Object.entries(STATE_ALIAS)) { if (d === hdxKey) { hdxKey = h; break; } }
    const lgaNameMap = {}; // lga_code → name from pairToLgaName
    for (const lc of Object.keys(lgas)) {
      lgaNameMap[lc] = pairToLgaName[sc + ':' + lc] || lc;
    }
    for (const [lc, wardSet] of Object.entries(lgas)) {
      const lgaName = lgaNameMap[lc];
      const hdxWards = mapping.wards[hdxKey]?.[lgaName];
      if (!hdxWards) continue;
      const sorted = [...wardSet].sort((a, b) => parseInt(a) - parseInt(b));
      const names = [...hdxWards].sort();
      sorted.forEach((code, i) => {
        tripleToWardName[sc + ':' + lc + ':' + code] = i < names.length ? names[i] : code;
      });
    }
  }
  console.log(`Built ${Object.keys(tripleToWardName).length} (state:lga:ward)→name mappings`);

  // 6. Restructure and write lga sheet
  console.log('\nWriting lga sheet...');
  // Deduplicate to unique (state_code, lga_code) pairs
  const lgaRows = [['code', 'name', 'state_code']];
  const seenLgaPairs = new Set();
  // Collect all unique pairs across states
  const allLgaPairs = [];
  for (const [sc, codes] of Object.entries(lgaPairsByState)) {
    for (const lc of codes) {
      const key = sc + ':' + lc;
      if (!seenLgaPairs.has(key)) {
        seenLgaPairs.add(key);
        allLgaPairs.push({ stateCode: sc, lgaCode: lc });
      }
    }
  }
  // Sort by state code then lga code
  allLgaPairs.sort((a, b) => parseInt(a.stateCode) - parseInt(b.stateCode) || parseInt(a.lgaCode) - parseInt(b.lgaCode));
  for (const { stateCode, lgaCode } of allLgaPairs) {
    const name = pairToLgaName[stateCode + ':' + lgaCode] || '';
    lgaRows.push([lgaCode, name, stateCode]);
  }
  console.log(`  ${lgaRows.length - 1} unique LGA rows`);

  // Clear lga sheet and write
  await clear('lga!A1:Z20999', token);
  await put(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/lga!A1:C${lgaRows.length}?valueInputOption=RAW`,
    token, { values: lgaRows });

  // 7. Restructure and write ward sheet
  console.log('Writing ward sheet...');
  const wardRows = [['code', 'name', 'lga_code', 'state_code']];
  const seenWardTriples = new Set();
  const allWardTriples = [];
  for (const [sc, lgas] of Object.entries(wardTriplesByState)) {
    for (const [lc, wards] of Object.entries(lgas)) {
      for (const wc of wards) {
        const key = sc + ':' + lc + ':' + wc;
        if (!seenWardTriples.has(key)) {
          seenWardTriples.add(key);
          allWardTriples.push({ stateCode: sc, lgaCode: lc, wardCode: wc });
        }
      }
    }
  }
  allWardTriples.sort((a, b) => parseInt(a.stateCode) - parseInt(b.stateCode) || parseInt(a.lgaCode) - parseInt(b.lgaCode) || parseInt(a.wardCode) - parseInt(b.wardCode));
  for (const { stateCode, lgaCode, wardCode } of allWardTriples) {
    const name = tripleToWardName[stateCode + ':' + lgaCode + ':' + wardCode] || '';
    wardRows.push([wardCode, name, lgaCode, stateCode]);
  }
  console.log(`  ${wardRows.length - 1} unique ward rows`);

  await clear('ward!A1:Z9999', token);
  await put(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ward!A1:D${wardRows.length}?valueInputOption=RAW`,
    token, { values: wardRows });

  console.log('\n=== Done ===');
  console.log(`LGA rows written: ${lgaRows.length - 1}`);
  console.log(`Ward rows written: ${wardRows.length - 1}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
