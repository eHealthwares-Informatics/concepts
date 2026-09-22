/* Throwaway probe: reproduce the /nearby 500 in-process using the compiled
 * service classes against the real DB. Run: node scripts/check-pharmacy-coords.cjs */
const { DataSource } = require('typeorm');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();

const entityModules = {
  pharmacies: require('../dist/modules/pharmacies/entities'),
  localities: require('../dist/modules/localities/entities'),
  facilities: require('../dist/modules/facilities/entities'),
  concepts: require('../dist/modules/concepts/entities'),
};

const ds = new DataSource({
  type: 'postgres',
  host: get('DB_HOST'),
  port: Number(get('DB_PORT')),
  username: get('DB_USER'),
  password: get('DB_PASSWORD'),
  database: get('DB_NAME'),
  entities: [
    ...Object.values(entityModules.pharmacies),
    ...Object.values(entityModules.localities),
    ...Object.values(entityModules.facilities),
    ...Object.values(entityModules.concepts),
  ].filter((e) => typeof e === 'function'),
  synchronize: false,
  logging: false,
});

ds.initialize()
  .then(async () => {
    const { PharmaciesService } = require('../dist/modules/pharmacies/services/pharmacies.service');
    const svc = new PharmaciesService(ds.getRepository('PharmacyEntity'), ds.getRepository('LocalityRelationEntity'));

    try {
      const rows = await svc.findNearby(6.5244, 3.3792, 10, 3);
      console.log('PHARMACY NEARBY OK:', JSON.stringify(rows, null, 1).slice(0, 600));
    } catch (e) {
      console.log('PHARMACY NEARBY FAILED:', e.message);
      if (e.query) console.log('SQL:', String(e.query));
      if (e.parameters) console.log('PARAMS:', JSON.stringify(e.parameters).slice(0, 300));
    }

    const { FacilitiesService } = require('../dist/modules/facilities/services/facilities.service');
    const fac = new FacilitiesService(
      ds.getRepository('FacilityEntity'),
      ds.getRepository('FacilityTypeEntity'),
      ds.getRepository('FacilityLevelEntity'),
      ds.getRepository('StateEntity'),
      ds.getRepository('LgaEntity'),
      ds.getRepository('WardEntity'),
    );
    try {
      const rows = await fac.findNearby(6.5244, 3.3792, 10, 3);
      console.log('FACILITY NEARBY OK:', JSON.stringify(rows, null, 1).slice(0, 600));
    } catch (e) {
      console.log('FACILITY NEARBY FAILED:', e.message);
      if (e.query) console.log('SQL:', String(e.query));
      if (e.parameters) console.log('PARAMS:', JSON.stringify(e.parameters).slice(0, 300));
    }

    await ds.destroy();
  })
  .catch((e) => {
    console.error('DS init failed:', e.message);
    process.exit(1);
  });
