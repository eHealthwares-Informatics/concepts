"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const facility_seeder_1 = require("./modules/facilities/seeders/facility.seeder");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: false,
        forbidUnknownValues: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Healthcare Concepts API')
        .setDescription('Facility Registry, Reference Data & FHIR R4 API. ' +
        'Provides REST endpoints for querying healthcare facilities by code, ward, LGA, ' +
        'facility type, and facility level, plus FHIR Location search and read endpoints. ' +
        'Includes a comprehensive concept/terminology service (LOINC, SNOMED, ICD-10, etc.).')
        .setVersion('1.0')
        .setExternalDoc('API Explorer', '/api/explorer')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = Number(process.env.PORT || 3013);
    await app.listen(port);
    console.log(`Healthcare Concepts service listening on port ${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
    console.log(`API Explorer: http://localhost:${port}/api/explorer`);
    const seeder = app.get(facility_seeder_1.FacilitySeederService);
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
}
bootstrap();
//# sourceMappingURL=main.js.map