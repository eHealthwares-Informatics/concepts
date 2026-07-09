import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodingConcept } from '../../../common/enums/concept.enum';
import { GoogleSheetsService } from '../../../common/services/google-sheets.service';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
  ImportTrackingEntity,
} from '../entities';

export interface SeederResult {
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

@Injectable()
export class ICDSeederService {
  private readonly logger = new Logger(ICDSeederService.name);
  private readonly icdSheetId: string;

  constructor(
    private configService: ConfigService,
    private googleSheetsService: GoogleSheetsService,
    @InjectRepository(ConceptCodingEntity)
    private conceptCodeRepository: Repository<ConceptCodingEntity>,
    @InjectRepository(ConceptAttributeEntity)
    private attributeRepository: Repository<ConceptAttributeEntity>,
    @InjectRepository(ConceptAttributeValueEntity)
    private valueRepository: Repository<ConceptAttributeValueEntity>,
    @InjectRepository(ImportTrackingEntity)
    private trackingRepository: Repository<ImportTrackingEntity>,
  ) {
    this.icdSheetId = this.configService.getOrThrow<string>('ICD_SHEET_ID');
  }

  async seedICDData(
    triggeredBy: string = 'system',
  ): Promise<SeederResult> {
    const stats = {
      codesCreated: 0,
      attributesCreated: 0,
      valuesCreated: 0,
      errors: [] as string[],
    };

    let tracking: Partial<ImportTrackingEntity> = {
      concept: 'ICD10',
      triggeredBy,
      status: 'success',
    };

    try {
      this.logger.log('Starting ICD-10 data import from Google Sheets...');

      const currentData = await this.googleSheetsService.fetchSheetData('ICD', this.icdSheetId);
      this.logger.log(`Fetched ${currentData.rows.length} rows from Google Sheets`);

      const attributeProcessingStats = await this.processAndCreateAttributes(
        currentData.headers,
        stats,
      );
      stats.attributesCreated = attributeProcessingStats;

      const { codesCreated, valuesCreated, rowsProcessed } =
        await this.processChangedRows(
          currentData.rows,
          stats,
          currentData.headers,
        );

      stats.codesCreated = codesCreated;
      stats.valuesCreated = valuesCreated;

      tracking = {
        ...tracking,
        revision: currentData.revision,
        totalRowsProcessed: rowsProcessed,
        rowsAdded: rowsProcessed,
        rowsModified: 0,
        rowsDeleted: 0,
      };

      await this.trackingRepository.save({
        ...tracking,
        status: stats.errors.length === 0 ? 'success' : 'partial',
        errorMessage:
          stats.errors.length > 0 ? stats.errors.join('; ') : undefined,
      });

      this.logger.log(
        `ICD-10 import completed: ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values`,
      );

      return {
        success: true,
        message: `Successfully imported ICD-10 data. Created ${stats.codesCreated} codes and ${stats.valuesCreated} attribute values.`,
        stats,
        tracking,
      };
    } catch (error: any) {
      this.logger.error(`ICD-10 import failed: ${error.message}`, error.stack);

      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push(errorMessage);

      await this.trackingRepository.save({
        ...tracking,
        status: 'failed',
        errorMessage,
      });

      return {
        success: false,
        message: `ICD-10 import failed: ${errorMessage}`,
        stats,
        tracking,
      };
    }
  }

  private async processAndCreateAttributes(
    headers: string[],
    stats: any,
  ): Promise<number> {
    const coreColumns = ['code', 'name', 'description', 'uuid', 'sync_status', 'sync_message', 'sync_time'];

    let created = 0;

    for (const header of headers) {
      if (coreColumns.includes(header)) continue;

      try {
        const existing = await this.attributeRepository.findOne({
          where: {
            concept: CodingConcept.ICD10,
            code: this.toSnakeCase(header),
          },
        });

        if (existing) continue;

        const attribute = this.attributeRepository.create({
          concept: CodingConcept.ICD10,
          code: this.toSnakeCase(header),
          name: header,
          dataType: 'string',
          isRequired: false,
          isMultiValued: false,
          isSearchable: true,
          isFilterable: false,
        });

        await this.attributeRepository.save(attribute);
        created++;
      } catch (error: any) {
        stats.errors.push(`Failed to create attribute ${header}: ${error.message}`);
      }
    }

    return created;
  }

  private async processChangedRows(
    allRows: Record<string, string>[],
    stats: any,
    headers: string[],
  ): Promise<{ codesCreated: number; valuesCreated: number; rowsProcessed: number }> {
    let codesCreated = 0;
    let valuesCreated = 0;
    const rowsToProcess = allRows;

    for (const row of rowsToProcess) {
      try {
        const code = row.code?.trim();
        const name = row.name?.trim();
        const description = row.description?.trim();

        if (!code) {
          stats.errors.push('Row missing code');
          continue;
        }

        let conceptCode = await this.conceptCodeRepository.findOne({
          where: {
            concept: CodingConcept.ICD10,
            code,
          },
        });

        if (!conceptCode) {
          conceptCode = this.conceptCodeRepository.create({
            concept: CodingConcept.ICD10,
            code,
            name: name || '',
            shortName: name || '',
            longName: name || '',
            shortDescription: description || '',
            longDescription: description || '',
          });
          conceptCode = await this.conceptCodeRepository.save(conceptCode);
          codesCreated++;
        } else {
          let changed = false;
          if (conceptCode.name !== name) { conceptCode.name = name || ''; changed = true; }
          if (conceptCode.shortName !== name) { conceptCode.shortName = name || ''; changed = true; }
          if (conceptCode.longName !== name) { conceptCode.longName = name || ''; changed = true; }
          if (conceptCode.shortDescription !== description) { conceptCode.shortDescription = description || ''; changed = true; }
          if (conceptCode.longDescription !== description) { conceptCode.longDescription = description || ''; changed = true; }
          if (changed) await this.conceptCodeRepository.save(conceptCode);
        }

        const coreColumns = ['code', 'name', 'description', 'uuid', 'sync_status', 'sync_message', 'sync_time'];
        const valuesToCreate: Partial<ConceptAttributeValueEntity>[] = [];

        for (const header of headers) {
          if (coreColumns.includes(header)) continue;

          const value = row[header]?.trim() || '';
          if (!value) continue;

          try {
            let attribute = await this.attributeRepository.findOne({
              where: {
                concept: CodingConcept.ICD10,
                code: this.toSnakeCase(header),
              },
            });

            if (!attribute) {
              attribute = this.attributeRepository.create({
                concept: CodingConcept.ICD10,
                code: this.toSnakeCase(header),
                name: header,
                dataType: 'string',
              });
              attribute = await this.attributeRepository.save(attribute);
            }

            const existingValue = await this.valueRepository.findOne({
              where: {
                conceptCode: { id: conceptCode.id },
                attribute: { id: attribute.id },
              },
            });

            if (!existingValue || existingValue.value !== value) {
              if (existingValue) {
                existingValue.value = value;
                await this.valueRepository.save(existingValue);
              } else {
                valuesToCreate.push({
                  conceptCode,
                  concept: CodingConcept.ICD10,
                  attribute,
                  value,
                  valueFormat: 'text',
                });
              }
              valuesCreated++;
            }
          } catch (error: any) {
            stats.errors.push(
              `Failed to process value for ${code}/${header}: ${error.message}`,
            );
          }
        }

        if (valuesToCreate.length > 0) {
          await this.valueRepository.save(valuesToCreate);
        }
      } catch (error: any) {
        stats.errors.push(
          `Failed to process row ${row.code}: ${error.message}`,
        );
      }
    }

    return {
      codesCreated,
      valuesCreated,
      rowsProcessed: rowsToProcess.length,
    };
  }

  private toSnakeCase(str: string): string {
    return str.toLowerCase().replace(/[\s-]+/g, '_');
  }

  async getImportHistory(limit: number = 10) {
    return this.trackingRepository.find({
      where: { concept: 'ICD10' },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getLatestImportStatus() {
    return this.trackingRepository.findOne({
      where: { concept: 'ICD10' },
      order: { timestamp: 'DESC' },
    });
  }
}
