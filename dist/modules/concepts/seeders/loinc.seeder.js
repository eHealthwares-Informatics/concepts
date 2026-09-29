"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LoincSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoincSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const google_sheets_service_1 = require("../../../common/services/google-sheets.service");
const entities_1 = require("../entities");
let LoincSeederService = LoincSeederService_1 = class LoincSeederService {
    googleSheetsService;
    conceptCodeRepository;
    attributeRepository;
    valueRepository;
    trackingRepository;
    logger = new common_1.Logger(LoincSeederService_1.name);
    constructor(googleSheetsService, conceptCodeRepository, attributeRepository, valueRepository, trackingRepository) {
        this.googleSheetsService = googleSheetsService;
        this.conceptCodeRepository = conceptCodeRepository;
        this.attributeRepository = attributeRepository;
        this.valueRepository = valueRepository;
        this.trackingRepository = trackingRepository;
    }
    async seedLoincData(triggeredBy = 'system') {
        const stats = {
            codesCreated: 0,
            attributesCreated: 0,
            valuesCreated: 0,
            errors: [],
        };
        let tracking = {
            concept: 'LOINC',
            triggeredBy,
            status: 'success',
        };
        try {
            this.logger.log('Starting LOINC data import from Google Sheets...');
            const currentData = await this.googleSheetsService.fetchSheetData('LOINC');
            this.logger.log(`Fetched ${currentData.rows.length} rows from Google Sheets`);
            const previousTracking = await this.trackingRepository.findOne({
                where: { concept: 'LOINC' },
                order: { timestamp: 'DESC' },
            });
            const attributeProcessingStats = await this.processAndCreateAttributes(currentData.headers, stats);
            stats.attributesCreated = attributeProcessingStats;
            const { codesCreated, valuesCreated, rowsProcessed } = await this.processChangedRows(currentData.rows, stats, currentData.headers);
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
                errorMessage: stats.errors.length > 0 ? stats.errors.join('; ') : undefined,
            });
            this.logger.log(`LOINC import completed: ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values`);
            return {
                success: true,
                message: `Successfully imported LOINC data. Created ${stats.codesCreated} codes and ${stats.valuesCreated} attribute values.`,
                stats,
                tracking,
            };
        }
        catch (error) {
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
    async processAndCreateAttributes(headers, stats) {
        const commonAttributes = [
            'LOINC_NUM',
            'COMPONENT',
            'SHORTNAME',
            'LONG_COMMON_NAME',
            'DefinitionDescription',
        ];
        let created = 0;
        for (const header of headers) {
            if (commonAttributes.includes(header)) {
                continue;
            }
            try {
                const existing = await this.attributeRepository.findOne({
                    where: {
                        concept: concept_enum_1.CodingConcept.LOINC,
                        code: this.toSnakeCase(header),
                    },
                });
                if (existing) {
                    continue;
                }
                const attribute = this.attributeRepository.create({
                    concept: concept_enum_1.CodingConcept.LOINC,
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
            }
            catch (error) {
                stats.errors.push(`Failed to create attribute ${header}: ${error.message}`);
            }
        }
        return created;
    }
    async processChangedRows(allRows, stats, headers) {
        let codesCreated = 0;
        let valuesCreated = 0;
        const rowsToProcess = allRows;
        for (const row of rowsToProcess) {
            try {
                const loincNum = row.LOINC_NUM?.trim();
                const component = row.COMPONENT?.trim();
                const shortName = row.SHORTNAME?.trim();
                const longName = row.LONG_COMMON_NAME?.trim();
                const description = row.DefinitionDescription?.trim();
                if (!loincNum) {
                    stats.errors.push('Row missing LOINC_NUM');
                    continue;
                }
                let conceptCode = await this.conceptCodeRepository.findOne({
                    where: {
                        concept: concept_enum_1.CodingConcept.LOINC,
                        code: loincNum,
                    },
                });
                if (!conceptCode) {
                    conceptCode = this.conceptCodeRepository.create({
                        concept: concept_enum_1.CodingConcept.LOINC,
                        code: loincNum || '',
                        name: component || '',
                        shortName: shortName || '',
                        longName: longName || '',
                        shortDescription: description || '',
                        longDescription: description || '',
                    });
                    conceptCode = await this.conceptCodeRepository.save(conceptCode);
                    codesCreated++;
                }
                else {
                    let changed = false;
                    if (conceptCode.name !== component) {
                        conceptCode.name = component || '';
                        changed = true;
                    }
                    if (conceptCode.shortName !== shortName) {
                        conceptCode.shortName = shortName || '';
                        changed = true;
                    }
                    if (conceptCode.longName !== longName) {
                        conceptCode.longName = longName || '';
                        changed = true;
                    }
                    if (conceptCode.shortDescription !== description) {
                        conceptCode.shortDescription = description || '';
                        changed = true;
                    }
                    if (conceptCode.longDescription !== description) {
                        conceptCode.longDescription = description || '';
                        changed = true;
                    }
                    if (changed)
                        await this.conceptCodeRepository.save(conceptCode);
                }
                const valuesToCreate = [];
                for (const header of headers) {
                    if (['LOINC_NUM', 'COMPONENT'].includes(header)) {
                        continue;
                    }
                    const value = row[header]?.trim() || '';
                    if (!value) {
                        continue;
                    }
                    try {
                        let attribute = await this.attributeRepository.findOne({
                            where: {
                                concept: concept_enum_1.CodingConcept.LOINC,
                                code: this.toSnakeCase(header),
                            },
                        });
                        if (!attribute) {
                            attribute = this.attributeRepository.create({
                                concept: concept_enum_1.CodingConcept.LOINC,
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
                            }
                            else {
                                valuesToCreate.push({
                                    conceptCode,
                                    concept: concept_enum_1.CodingConcept.LOINC,
                                    attribute,
                                    value,
                                    valueFormat: 'text',
                                });
                            }
                            valuesCreated++;
                        }
                    }
                    catch (error) {
                        stats.errors.push(`Failed to process value for ${loincNum}/${header}: ${error.message}`);
                    }
                }
                if (valuesToCreate.length > 0) {
                    await this.valueRepository.save(valuesToCreate);
                }
            }
            catch (error) {
                stats.errors.push(`Failed to process row ${row.LOINC_NUM}: ${error.message}`);
            }
        }
        return {
            codesCreated,
            valuesCreated,
            rowsProcessed: rowsToProcess.length,
        };
    }
    toSnakeCase(str) {
        return str
            .toLowerCase()
            .replace(/[\s-]+/g, '_');
    }
    async getImportHistory(limit = 10) {
        return this.trackingRepository.find({
            where: { concept: 'LOINC' },
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
    async getLatestImportStatus() {
        return this.trackingRepository.findOne({
            where: { concept: 'LOINC' },
            order: { timestamp: 'DESC' },
        });
    }
};
exports.LoincSeederService = LoincSeederService;
exports.LoincSeederService = LoincSeederService = LoincSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ConceptCodingEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeValueEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.ImportTrackingEntity)),
    __metadata("design:paramtypes", [google_sheets_service_1.GoogleSheetsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LoincSeederService);
//# sourceMappingURL=loinc.seeder.js.map