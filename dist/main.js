"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const seed_orchestrator_service_1 = require("./seed/seed-orchestrator.service");
const config_1 = require("@nestjs/config");
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
    const port = Number(process.env.PORT || 3011);
    await app.listen(port);
    console.log(`Healthcare Concepts service listening on port ${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
    console.log(`API Explorer: http://localhost:${port}/api/explorer`);
    if (Boolean(app.get(config_1.ConfigService).get('SEED_ON_START')))
        app.get(seed_orchestrator_service_1.SeedOrchestratorService).seedAll();
}
bootstrap();
//# sourceMappingURL=main.js.map