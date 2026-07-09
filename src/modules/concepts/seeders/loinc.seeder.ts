import { Injectable, Logger } from '@nestjs/common';
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
export class LoincSeederService {
  private readonly logger = new Logger(LoincSeederService.name);

  constructor(
    private googleSheetsService: GoogleSheetsService,
    @InjectRepository(ConceptCodingEntity)
    private conceptCodeRepository: Repository<ConceptCodingEntity>,
    @InjectRepository(ConceptAttributeEntity)
    private attributeRepository: Repository<ConceptAttributeEntity>,
    @InjectRepository(ConceptAttributeValueEntity)
    private valueRepository: Repository<ConceptAttributeValueEntity>,
    @InjectRepository(ImportTrackingEntity)
    private trackingRepository: Repository<ImportTrackingEntity>,
  ) {}

  /**
   * Main seeding method to import LOINC data from Google Sheets
   */
  async seedLoincData(
    triggeredBy: string = 'system',
  ): Promise<SeederResult> {
    const stats = {
      codesCreated: 0,
      attributesCreated: 0,
      valuesCreated: 0,
      errors: [] as string[],
    };

    let tracking: Partial<ImportTrackingEntity> = {
      concept: 'LOINC',
      triggeredBy,
      status: 'success',
    };

    try {
      this.logger.log('Starting LOINC data import from Google Sheets...');

      // Fetch data from Google Sheets
      const currentData = await this.googleSheetsService.fetchSheetData('LOINC');
      this.logger.log(`Fetched ${currentData.rows.length} rows from Google Sheets`);

      // Get previous import tracking for change detection
      const previousTracking = await this.trackingRepository.findOne({
        where: { concept: 'LOINC' },
        order: { timestamp: 'DESC' },
      });

      // Process columns once to create attributes
      const attributeProcessingStats = await this.processAndCreateAttributes(
        currentData.headers,
        stats,
      );
      stats.attributesCreated = attributeProcessingStats;

      // Process all rows in upsert mode
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

      // Save import tracking record
      await this.trackingRepository.save({
        ...tracking,
        status: stats.errors.length === 0 ? 'success' : 'partial',
        errorMessage:
          stats.errors.length > 0 ? stats.errors.join('; ') : undefined,
      });

      this.logger.log(
        `LOINC import completed: ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values`,
      );

      return {
        success: true,
        message: `Successfully imported LOINC data. Created ${stats.codesCreated} codes and ${stats.valuesCreated} attribute values.`,
        stats,
        tracking,
      };
    } catch (error: any) {
      this.logger.error(`LOINC import failed: ${error.message}`, error.stack);

      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push(errorMessage);

      await this.trackingRepository.save({
        ...tracking,
        status: 'failed',
        errorMessage,
      });

      return {
        success: false,
        message: `LOINC import failed: ${errorMessage}`,
        stats,
        tracking,
      };
    }
  }

  /**
   * Process and create ConceptAttribute entities from sheet headers
   */
  private async processAndCreateAttributes(
    headers: string[],
    stats: any,
  ): Promise<number> {
    const commonAttributes = [
      'LOINC_NUM', // This becomes ConceptCodeEntity.code
      'COMPONENT', // This becomes ConceptCodeEntity.shortName
      'SHORTNAME', // This becomes ConceptCodeEntity.shortName
      'LONG_COMMON_NAME', // This becomes ConceptCodeEntity.shortName
      'DefinitionDescription', // This becomes ConceptCodeEntity.shortName
    ];

    let created = 0;

    for (const header of headers) {
      // Skip the main code columns
      if (commonAttributes.includes(header)) {
        continue;
      }

      try {
        // Check if attribute already exists
        const existing = await this.attributeRepository.findOne({
          where: {
            concept: CodingConcept.LOINC,
            code: this.toSnakeCase(header),
          },
        });

        if (existing) {
          continue; // Skip if already exists
        }

        // Create new attribute
        const attribute = this.attributeRepository.create({
          concept: CodingConcept.LOINC,
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

  /**
   * Process changed rows and create/update ConceptCodeEntity and ConceptAttributeValueEntity records
   */
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
        // Extract LOINC_NUM and COMPONENT
        const loincNum = row.LOINC_NUM?.trim();
        const component = row.COMPONENT?.trim();
        const shortName = row.SHORTNAME?.trim();
        const longName = row.LONG_COMMON_NAME?.trim();
        const description = row.DefinitionDescription?.trim();

        if (!loincNum) {
          stats.errors.push('Row missing LOINC_NUM');
          continue;
        }

        // Check if code already exists
        let conceptCode = await this.conceptCodeRepository.findOne({
          where: {
            concept: CodingConcept.LOINC,
            code: loincNum,
          },
        });

        if (!conceptCode) {
          // Create new ConceptCodeEntity
          conceptCode = this.conceptCodeRepository.create({
            concept: CodingConcept.LOINC,
            code: loincNum || '',
            name: component || '',
            shortName: shortName || '',
            longName: longName || '',
            shortDescription: description || '',
            longDescription: description || '',
          });
          conceptCode = await this.conceptCodeRepository.save(conceptCode);
          codesCreated++;
        } else {
          // Upsert — update existing code fields
          let changed = false;
          if (conceptCode.name !== component) { conceptCode.name = component || ''; changed = true; }
          if (conceptCode.shortName !== shortName) { conceptCode.shortName = shortName || ''; changed = true; }
          if (conceptCode.longName !== longName) { conceptCode.longName = longName || ''; changed = true; }
          if (conceptCode.shortDescription !== description) { conceptCode.shortDescription = description || ''; changed = true; }
          if (conceptCode.longDescription !== description) { conceptCode.longDescription = description || ''; changed = true; }
          if (changed) await this.conceptCodeRepository.save(conceptCode);
        }

        // Process all attribute values for this code
        const valuesToCreate: Partial<ConceptAttributeValueEntity>[] = [];

        for (const header of headers) {
          // Skip the main code columns
          if (['LOINC_NUM', 'COMPONENT'].includes(header)) {
            continue;
          }

          const value = row[header]?.trim() || '';
          if (!value) {
            continue; // Skip empty values
          }

          try {
            // Get or create attribute
            let attribute = await this.attributeRepository.findOne({
              where: {
                concept: CodingConcept.LOINC,
                code: this.toSnakeCase(header),
              },
            });

            if (!attribute) {
              attribute = this.attributeRepository.create({
                concept: CodingConcept.LOINC,
                code: this.toSnakeCase(header),
                name: header,
                dataType: 'string',
              });
              attribute = await this.attributeRepository.save(attribute);
            }

            // Create or update value
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
                  concept: CodingConcept.LOINC,
                  attribute,
                  value,
                  valueFormat: 'text',
                });
              }
              valuesCreated++;
            }
          } catch (error: any) {
            stats.errors.push(
              `Failed to process value for ${loincNum}/${header}: ${error.message}`,
            );
          }
        }

        // Batch save values
        if (valuesToCreate.length > 0) {
          await this.valueRepository.save(valuesToCreate);
        }
      } catch (error: any) {
        stats.errors.push(
          `Failed to process row ${row.LOINC_NUM}: ${error.message}`,
        );
      }
    }

    return {
      codesCreated,
      valuesCreated,
      rowsProcessed: rowsToProcess.length,
    };
  }

  /**
   * Helper to convert header names to snake_case for attribute codes
   */
  private toSnakeCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[\s-]+/g, '_') 
  }

  /**
   * Get import history for LOINC concept
   */
  async getImportHistory(limit: number = 10) {
    return this.trackingRepository.find({
      where: { concept: 'LOINC' },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get the latest import status
   */
  async getLatestImportStatus() {
    return this.trackingRepository.findOne({
      where: { concept: 'LOINC' },
      order: { timestamp: 'DESC' },
    });
  }
}
