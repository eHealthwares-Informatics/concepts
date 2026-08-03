import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FacilitySeederService } from './modules/facilities/seeders/facility.seeder';
import { SeedOrchestratorService } from './seed/seed-orchestrator.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidUnknownValues: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Healthcare Concepts API')
    .setDescription(
      'Facility Registry, Reference Data & FHIR R4 API. ' +
      'Provides REST endpoints for querying healthcare facilities by code, ward, LGA, ' +
      'facility type, and facility level, plus FHIR Location search and read endpoints. ' +
      'Includes a comprehensive concept/terminology service (LOINC, SNOMED, ICD-10, etc.).',
    )
    .setVersion('1.0')
    .setExternalDoc('API Explorer', '/api/explorer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT || 3011);
  await app.listen(port);
  console.log(`Healthcare Concepts service listening on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`API Explorer: http://localhost:${port}/api/explorer`);
  // if (Boolean(app.get(ConfigService).get('SEED_ON_START')))
  // app.get(SeedOrchestratorService).seedAll()


  // const seeder = app.get(FacilitySeederService);
  
  //   const result = await seeder.seedFacilities();
  
  //   console.log('\n═══════════════════════════════════════════');
  //   console.log('FACILITY SEED RESULT');
  //   console.log('═══════════════════════════════════════════');
  //   console.log(`  Success: ${result.success}`);
  //   console.log(`  Message: ${result.message}`);
  //   console.log(`\n  Stats:`);
  //   console.log(`    States: ${result.stats.statesCreated}`);
  //   console.log(`    LGAs: ${result.stats.lgasCreated}`);
  //   console.log(`    Wards: ${result.stats.wardsCreated}`);
  //   console.log(`    Facility Types: ${result.stats.facilityTypesCreated}`);
  //   console.log(`    Facility Levels: ${result.stats.facilityLevelsCreated}`);
  //   console.log(`    Derived Codes: ${result.stats.derivedCodesCreated}`);
  //   console.log(`    Facilities Created: ${result.stats.facilitiesCreated}`);
  //   console.log(`    Facilities Updated: ${result.stats.facilitiesUpdated}`);
  //   console.log(`    Facility Attributes: ${result.stats.facilityAttributesCreated}`);
  //   if (result.stats.errors.length > 0) {
  //     console.log(`\n  Errors (${result.stats.errors.length}):`);
  //     for (const err of result.stats.errors.slice(0, 20)) {
  //       console.log(`    - ${err}`);
  //     }
  //   }
}


bootstrap()