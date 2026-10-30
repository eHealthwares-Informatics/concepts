import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ClinicalSeederService } from '../modules/clinical/seeders/clinical.seeder';

/**
 * Clinical knowledge-base seed entrypoint.
 *
 * The other seed:* npm scripts rely on nest-commander commands that this
 * application never boots through a CommandFactory, so this script follows
 * src/cli.ts instead: create an application context (which also runs TypeORM
 * synchronize, creating the clinical tables) and invoke the seeder directly.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(ClinicalSeederService);

  const result = await seeder.seedClinical();

  console.log('\n═══════════════════════════════════════════');
  console.log('CLINICAL SEED RESULT');
  console.log('═══════════════════════════════════════════');
  console.log(`  Success: ${result.success}`);
  console.log(`  Message: ${result.message}`);
  console.log('  Stats:');
  for (const [key, value] of Object.entries(result.stats)) {
    console.log(`    ${key}: ${value}`);
  }

  await app.close();
  if (!result.success) process.exit(1);
}

bootstrap().catch((err) => {
  console.error('Clinical seed failed:', err);
  process.exit(1);
});
