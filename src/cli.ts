import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FacilitySeederService } from './modules/facilities/seeders/facility.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(FacilitySeederService);

  const result = await seeder.seedFacilities();

  console.log('\n═══════════════════════════════════════════');
  console.log('FACILITY SEED RESULT');
  console.log('═══════════════════════════════════════════');
  console.log(`  Success: ${result.success}`);
  console.log(`  Message: ${result.message}`);
  console.log(`\n  Stats:`);
  console.log(`    States: ${result.stats.statesCreated}`);
  console.log(`    LGAs: ${result.stats.lgasCreated}`);
  console.log(`    Wards: ${result.stats.wardsCreated}`);
  console.log(`    Facility Types: ${result.stats.facilityTypesCreated}`);
  console.log(`    Facility Levels: ${result.stats.facilityLevelsCreated}`);
  console.log(`    Derived Codes: ${result.stats.derivedCodesCreated}`);
  console.log(`    Facilities Created: ${result.stats.facilitiesCreated}`);
  console.log(`    Facilities Updated: ${result.stats.facilitiesUpdated}`);
  console.log(`    Facility Attributes: ${result.stats.facilityAttributesCreated}`);
  if (result.stats.errors.length > 0) {
    console.log(`\n  Errors (${result.stats.errors.length}):`);
    for (const err of result.stats.errors.slice(0, 20)) {
      console.log(`    - ${err}`);
    }
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('CLI failed:', err);
  process.exit(1);
});
