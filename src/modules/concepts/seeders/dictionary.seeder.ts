import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { resolve, join } from 'path';
import { CodingConcept } from '../../../common/enums/concept.enum';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ImportTrackingEntity,
} from '../entities';

export interface DictionarySeederResult {
  success: boolean;
  message: string;
  stats: {
    codesCreated: number;
    attributesCreated: number;
    valuesCreated: number;
    errors: string[];
  };
  tracking: Partial<ImportTrackingEntity>;
}

const SEEDS_CANDIDATES = [
  join(process.cwd(), 'seeds'),
  resolve(__dirname, '..', '..', '..', 'seeds'),
  resolve(__dirname, '..', '..', '..', '..', 'seeds'),
];

@Injectable()
export class DictionarySeederService {
  private readonly logger = new Logger(DictionarySeederService.name);

  constructor(
    @InjectRepository(ConceptCodingEntity)
    private readonly conceptCodeRepository: Repository<ConceptCodingEntity>,
    @InjectRepository(ConceptAttributeEntity)
    private readonly attributeRepository: Repository<ConceptAttributeEntity>,
    @InjectRepository(ConceptAttributeValueEntity)
    private readonly valueRepository: Repository<ConceptAttributeValueEntity>,
    @InjectRepository(ImportTrackingEntity)
    private readonly trackingRepository: Repository<ImportTrackingEntity>,
  ) {}

  async seedDictionaryData(triggeredBy: string = 'system'): Promise<DictionarySeederResult> {
    const stats = {
      codesCreated: 0,
      attributesCreated: 0,
      valuesCreated: 0,
      errors: [] as string[],
    };

    let tracking: Partial<ImportTrackingEntity> = {
      concept: CodingConcept.DICTIONARY,
      triggeredBy,
      status: 'success',
    };

    try {
      const seedsDir = this.resolveSeedsDir();
      const categories = this.readCsv(seedsDir, 'lis_dictionary_categories.csv');
      const entries = this.readCsv(seedsDir, 'lis_dictionary_entries.csv');

      // Categories become ConceptAttribute rows (one "dimension" per category)
      const attributeByOpenelisId = new Map<string, ConceptAttributeEntity>();
      for (const row of categories) {
        const code = row.code?.trim();
        if (!code) continue;
        let attribute = await this.attributeRepository.findOne({
          where: { concept: CodingConcept.DICTIONARY, code },
        });
        if (!attribute) {
          try {
            attribute = await this.attributeRepository.save(
              this.attributeRepository.create({
                concept: CodingConcept.DICTIONARY,
                code,
                name: row.name || code,
                dataType: 'coded',
                isRequired: false,
                isMultiValued: false,
                isSearchable: true,
                isFilterable: true,
                description: row.description || row.localAbbrev || undefined,
              }),
            );
            stats.attributesCreated += 1;
          } catch (err: any) {
            if (err?.code !== '23505') throw err;
            attribute = await this.attributeRepository.findOne({
              where: { concept: CodingConcept.DICTIONARY, code },
            });
          }
        }
        if (attribute) attributeByOpenelisId.set(row.openelisId?.trim(), attribute);
      }

      // Entries become ConceptCode rows linked to their category attribute
      for (const row of entries) {
        const code = row.code?.trim();
        if (!code) continue;
        const dictEntry = row.dictEntry?.trim() || code;
        const name = dictEntry.length > 255 ? dictEntry.slice(0, 255) : dictEntry;
        const longDescription = dictEntry.length > 500 ? dictEntry.slice(0, 500) : dictEntry;

        const existing = await this.conceptCodeRepository.findOne({
          where: { concept: CodingConcept.DICTIONARY, code },
        });
        let conceptCode: ConceptCodingEntity;
        if (existing) {
          conceptCode = existing;
        } else {
          try {
            conceptCode = await this.conceptCodeRepository.save(
              this.conceptCodeRepository.create({
                concept: CodingConcept.DICTIONARY,
                code,
                name,
                shortName: row.localAbbrev?.trim() || undefined,
                shortDescription: name,
                longDescription,
              }),
            );
            stats.codesCreated += 1;
          } catch (err: any) {
            if (err?.code !== '23505') throw err;
            const reloaded = await this.conceptCodeRepository.findOne({
              where: { concept: CodingConcept.DICTIONARY, code },
            });
            if (!reloaded) throw err;
            conceptCode = reloaded;
          }
        }

        const categoryAttr = attributeByOpenelisId.get(row.dictionaryCategoryId?.trim());
        if (!categoryAttr) continue;

        const existingValue = await this.valueRepository.findOne({
          where: {
            conceptCode: { id: conceptCode.id },
            attribute: { id: categoryAttr.id },
          },
        });
        if (existingValue) continue;

        try {
          await this.valueRepository.save(
            this.valueRepository.create({
              conceptCode,
              concept: CodingConcept.DICTIONARY,
              attribute: categoryAttr,
              value: dictEntry,
              valueFormat: 'coded',
            }),
          );
          stats.valuesCreated += 1;
        } catch (err: any) {
          if (err?.code !== '23505') throw err;
        }
      }

      await this.trackingRepository.save({
        ...tracking,
        revision: `csv-${categories.length}-${entries.length}`,
        totalRowsProcessed: entries.length,
        rowsAdded: stats.codesCreated,
        rowsModified: 0,
        rowsDeleted: 0,
        status: 'success',
      });

      this.logger.log(
        `Dictionary import completed: ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values`,
      );

      return {
        success: true,
        message: `Successfully imported dictionary. Created ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values.`,
        stats,
        tracking,
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push(errorMessage);
      this.logger.error(`Dictionary import failed: ${errorMessage}`);

      await this.trackingRepository.save({
        ...tracking,
        revision: 'error',
        totalRowsProcessed: 0,
        rowsAdded: 0,
        rowsModified: 0,
        rowsDeleted: 0,
        status: 'failed',
        errorMessage,
      });

      return {
        success: false,
        message: `Dictionary import failed: ${errorMessage}`,
        stats,
        tracking,
      };
    }
  }

  private resolveSeedsDir(): string {
    for (const candidate of SEEDS_CANDIDATES) {
      if (
        existsSync(candidate) &&
        existsSync(join(candidate, 'lis_dictionary_categories.csv'))
      ) {
        return candidate;
      }
    }
    return SEEDS_CANDIDATES[0];
  }

  private readCsv(dir: string, filename: string): Record<string, string>[] {
    const content = readFileSync(join(dir, filename), 'utf-8');
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  }
}
