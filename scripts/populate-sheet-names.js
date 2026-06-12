const {GoogleAuth} = require('google-auth-library');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SHEET_ID = process.env.FACILITY_SHEET_ID;
const MAP_PATH = '/tmp/lga_ward_map.json';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

function fetch(url, token) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { Authorization: 'Bearer ' + token } }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        const parsed = JSON.parse(d);
        if (parsed.error) rej(new Error(parsed.error.message));
        else res(parsed);
      });
    }).on('error', rej);
  });
}

function put(url, token, body) {
  return new Promise((res, rej) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        const parsed = JSON.parse(d);
        if (parsed.error) rej(new Error(parsed.error.message));
        else res(parsed);
      });
    });
    req.on('error', rej);
    req.write(data);
    req.end();
  });
}

// State name normalization
const STATE_ALIAS = { 'Akwa-Ibom': 'Akwa Ibom', 'FCT': 'Abuja FCT' };

async function main() {
  const token = await getToken();
  const mapping = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));

  // 1. Get all sheet names
  const meta = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`,
    token
  );
  const allSheets = meta.sheets.map(s => s.properties.title);
  const facilitySheets = allSheets.filter(n => n.startsWith('facility_'));
  console.log(`Found ${facilitySheets.length} facility sheets`);

  // 2. Extract (state_code, lga_code, ward_code) from all facility sheets
  const lgaCodesByState = {};
  const wardCodesByLga = {};
  for (const sheetName of facilitySheets) {
    const data = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}`,
      token
    );
    const headers = (data.values || [])[0] || [];
    const rows = (data.values || []).slice(1);
    for (const row of rows) {
      const r = Object.fromEntries(headers.map((h, i) => [h, (row[i] || '').trim()]));
      if (r.state_code && r.lga_code) {
        (lgaCodesByState[r.state_code] ??= new Set()).add(r.lga_code);
        if (r.ward_code) {
          const key = r.state_code + ':' + r.lga_code;
          (wardCodesByLga[key] ??= new Set()).add(r.ward_code);
        }
      }
    }
  }
  console.log(`Extracted LGA codes from ${Object.keys(lgaCodesByState).length} states`);

  // 3. Build LGA code→name mapping
  const lgaCodeToName = {};
  // Get state names from mapping
  const stateNameByCode = {};
  // Read state sheet for state code→name
  const stateData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/state`,
    token
  );
  const sHeaders = (stateData.values || [])[0] || [];
  for (const row of (stateData.values || []).slice(1)) {
    const r = Object.fromEntries(sHeaders.map((h, i) => [h, (row[i] || '').trim()]));
    if (r.code && r.name) stateNameByCode[r.code] = r.name;
  }

  for (const [stateCode, codeSet] of Object.entries(lgaCodesByState)) {
    const stateName = stateNameByCode[stateCode];
    if (!stateName) {
      console.log(`  Warning: no name for state code ${stateCode}`);
      continue;
    }
    // HDX key: normalize state name
    let hdxKey = stateName;
    for (const [hdx, db] of Object.entries(STATE_ALIAS)) {
      if (db === hdxKey) { hdxKey = hdx; break; }
    }
    const hdxLgas = mapping.lgas[hdxKey];
    if (!hdxLgas) {
      console.log(`  Warning: "${stateName}" not in HDX mapping`);
      continue;
    }
    const sortedCodes = [...codeSet].sort((a, b) => parseInt(a) - parseInt(b));
    const sortedNames = [...hdxLgas].sort();
    sortedCodes.forEach((code, i) => {
      lgaCodeToName[code] = i < sortedNames.length ? sortedNames[i] : code;
    });
  }
  console.log(`Built ${Object.keys(lgaCodeToName).length} LGA code→name mappings`);

  // 4. Build ward code→name mapping
  const wardCodeToName = {};
  for (const [stateLga, codeSet] of Object.entries(wardCodesByLga)) {
    const [stateCode, lgaCode] = stateLga.split(':');
    const lgaName = lgaCodeToName[lgaCode];
    if (!lgaName) continue;
    const stateName = stateNameByCode[stateCode];
    if (!stateName) continue;
    let hdxKey = stateName;
    for (const [hdx, db] of Object.entries(STATE_ALIAS)) {
      if (db === hdxKey) { hdxKey = hdx; break; }
    }
    const hdxWards = mapping.wards[hdxKey]?.[lgaName];
    if (!hdxWards) continue;
    const sortedCodes = [...codeSet].sort((a, b) => parseInt(a) - parseInt(b));
    const sortedNames = [...hdxWards].sort();
    sortedCodes.forEach((code, i) => {
      wardCodeToName[code] = i < sortedNames.length ? sortedNames[i] : code;
    });
  }
  console.log(`Built ${Object.keys(wardCodeToName).length} ward code→name mappings`);

  // 5. Update lga sheet
  console.log('\nReading lga sheet...');
  const lgaData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/lga`,
    token
  );
  const lgaRows = lgaData.values || [];
  const lgaCodeIdx = 0, lgaNameIdx = 1;
  let lgaUpdates = 0;
  for (let i = 1; i < lgaRows.length; i++) {
    const row = lgaRows[i];
    const code = (row[lgaCodeIdx] || '').trim();
    const name = (row[lgaNameIdx] || '').trim();
    if (code && !name && lgaCodeToName[code]) {
      lgaRows[i][lgaNameIdx] = lgaCodeToName[code];
      lgaUpdates++;
    }
  }
  console.log(`Need to update ${lgaUpdates} LGA name cells`);

  if (lgaUpdates > 0) {
    // Write entire sheet back
    const result = await put(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/lga!A1:F${lgaRows.length}?valueInputOption=USER_ENTERED`,
      token,
      { values: lgaRows }
    );
    console.log(`  Updated ${result.updatedCells} LGA cells`);
  }

  // 6. Update ward sheet
  console.log('\nReading ward sheet...');
  const wardData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ward`,
    token
  );
  const wardRows = wardData.values || [];
  const wCodeIdx = 0, wNameIdx = 1;
  let wardUpdates = 0;
  for (let i = 1; i < wardRows.length; i++) {
    const row = wardRows[i];
    const code = (row[wCodeIdx] || '').trim();
    const name = (row[wNameIdx] || '').trim();
    if (code && !name && wardCodeToName[code]) {
      wardRows[i][wNameIdx] = wardCodeToName[code];
      wardUpdates++;
    }
  }
  console.log(`Need to update ${wardUpdates} ward name cells`);

  if (wardUpdates > 0) {
    const result = await put(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ward!A1:F${wardRows.length}?valueInputOption=USER_ENTERED`,
      token,
      { values: wardRows }
    );
    console.log(`  Updated ${result.updatedCells} ward cells`);
  }

  console.log('\n=== Done ===');
  console.log(`LGA rows: ${lgaRows.length - 1}, updated: ${lgaUpdates}`);
  console.log(`Ward rows: ${wardRows.length - 1}, updated: ${wardUpdates}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
