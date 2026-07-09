import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugComponentEntity, GenericProductEntity, PharmaceuticsEntity } from '../entities';
import { genericDrugData } from './generic-drugs.data';

export interface DrugSeederResult {
  success: boolean;
  message: string;
  stats: {
    drugComponents: number;
    pharmaceutics: number;
    genericProducts: number;
  };
}

type SeedCache = {
  componentByName: Map<string, DrugComponentEntity>;
  pharmaceuticsByCode: Map<string, PharmaceuticsEntity>;
  genericByCode: Map<string, GenericProductEntity>;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed: string = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildPharmacologyComponentMap(): Map<string, string[]> {
  const componentNamesByCode = new Map<string, Set<string>>();

  for (const drug of genericDrugData.drugs) {
    const names: string[] = Array.isArray(drug.drugComponentNames) ? drug.drugComponentNames : [];
    const codes: string[] = Array.isArray(drug.pharmaceuticsCode) ? drug.pharmaceuticsCode : [];

    for (const rawCode of codes) {
      const code = asNonEmptyString(rawCode);
      if (!code) continue;

      let bucket = componentNamesByCode.get(code);
      if (!bucket) {
        bucket = new Set<string>();
        componentNamesByCode.set(code, bucket);
      }

      for (const rawName of names) {
        const name = asNonEmptyString(rawName);
        if (name) bucket.add(name);
      }
    }
  }

  const output = new Map<string, string[]>();
  for (const [code, names] of componentNamesByCode.entries()) {
    output.set(code, [...names]);
  }
  return output;
}

@Injectable()
export class DrugSeederService {
  private readonly logger = new Logger(DrugSeederService.name);

  constructor(
    @InjectRepository(DrugComponentEntity)
    private readonly componentRepository: Repository<DrugComponentEntity>,
    @InjectRepository(PharmaceuticsEntity)
    private readonly pharmaceuticsRepository: Repository<PharmaceuticsEntity>,
    @InjectRepository(GenericProductEntity)
    private readonly genericRepository: Repository<GenericProductEntity>,
  ) {}

  async seedDrugs(): Promise<DrugSeederResult> {
    const stats = { drugComponents: 0, pharmaceutics: 0, genericProducts: 0 };

    try {
      const cache = await this.loadCaches();

      for (const componentName of Object.keys(genericDrugData.drugComponentIndex)) {
        const name = asNonEmptyString(componentName);
        if (!name || cache.componentByName.has(name)) continue;
        const created = this.componentRepository.create({ name });
        const saved = await this.componentRepository.save(created);
        cache.componentByName.set(saved.name, saved);
        stats.drugComponents++;
      }

      const componentsByPharmacologyCode = buildPharmacologyComponentMap();

      for (const [rawCode, info] of Object.entries(genericDrugData.pharmaceuticsIndex)) {
        const code = asNonEmptyString(rawCode);
        if (!code || cache.pharmaceuticsByCode.has(code)) continue;

        const componentNames = componentsByPharmacologyCode.get(code) ?? [];
        const componentEntities = componentNames
          .map((name) => cache.componentByName.get(name))
          .filter((entry): entry is DrugComponentEntity => Boolean(entry));

        const created = this.pharmaceuticsRepository.create({
          code,
          clinicalName: info.clinicalName,
          drugClass: info.drugClass,
          pharmaceutics: info.pharmacology,
          indications: info.indications,
          contraindications: info.contraindications,
          mechanism: info.mechanism,
          drugComponents: componentEntities,
        });
        const saved = await this.pharmaceuticsRepository.save(created);
        cache.pharmaceuticsByCode.set(saved.code, saved);
        stats.pharmaceutics++;
      }

      for (const drug of genericDrugData.drugs) {
        const code = asNonEmptyString(drug.code);
        if (!code || cache.genericByCode.has(code)) continue;

        const pharmacologyCode = drug.pharmaceuticsCode.find((item) => asNonEmptyString(item));
        if (!pharmacologyCode) continue;

        const pharmaceutics = cache.pharmaceuticsByCode.get(pharmacologyCode);
        if (!pharmaceutics) continue;

        const created = this.genericRepository.create({
          code,
          name: drug.name,
          generalUse: drug.generalUse,
          adultDosage: drug.adultDosage,
          pediatricDosage: drug.pediatricDosage,
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          pharmaceutics,
        });
        const saved = await this.genericRepository.save(created);
        cache.genericByCode.set(saved.code, saved);
        stats.genericProducts++;
      }

      this.logger.log(`Seeded: ${stats.drugComponents} components, ${stats.pharmaceutics} pharmaceutics, ${stats.genericProducts} generic products`);

      return { success: true, message: `Seeded ${stats.genericProducts} generic products, ${stats.pharmaceutics} pharmaceutics, ${stats.drugComponents} components`, stats };
    } catch (err: any) {
      this.logger.error(`Drug seeding failed: ${err.message}`);
      return { success: false, message: err.message, stats };
    }
  }

  private async loadCaches(): Promise<SeedCache> {
    const [components, pharmaceutics, generics] = await Promise.all([
      this.componentRepository.find({ relations: { pharmaceutics: true } }),
      this.pharmaceuticsRepository.find({ relations: { drugComponents: true } }),
      this.genericRepository.find({ relations: { pharmaceutics: true } }),
    ]);

    return {
      componentByName: new Map(components.map((entity) => [entity.name, entity])),
      pharmaceuticsByCode: new Map(pharmaceutics.map((entity) => [entity.code, entity])),
      genericByCode: new Map(generics.map((entity) => [entity.code, entity])),
    };
  }
}
