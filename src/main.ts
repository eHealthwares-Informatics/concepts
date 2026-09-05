import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
}


bootstrap()