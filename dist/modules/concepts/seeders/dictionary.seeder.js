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
var DictionarySeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionarySeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs_1 = require("fs");
const sync_1 = require("csv-parse/sync");
const path_1 = require("path");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const entities_1 = require("../entities");
const SEEDS_CANDIDATES = [
    (0, path_1.join)(process.cwd(), 'seeds'),
    (0, path_1.resolve)(__dirname, '..', '..', '..', 'seeds'),
    (0, path_1.resolve)(__dirname, '..', '..', '..', '..', 'seeds'),
];
let DictionarySeederService = DictionarySeederService_1 = class DictionarySeederService {
    conceptCodeRepository;
    attributeRepository;
    valueRepository;
    trackingRepository;
    logger = new common_1.Logger(DictionarySeederService_1.name);
    constructor(conceptCodeRepository, attributeRepository, valueRepository, trackingRepository) {
        this.conceptCodeRepository = conceptCodeRepository;
        this.attributeRepository = attributeRepository;
        this.valueRepository = valueRepository;
        this.trackingRepository = trackingRepository;
    }
    async seedDictionaryData(triggeredBy = 'system') {
        const stats = {
            codesCreated: 0,
            attributesCreated: 0,
            valuesCreated: 0,
            errors: [],
        };
        let tracking = {
            concept: concept_enum_1.CodingConcept.DICTIONARY,
            triggeredBy,
            status: 'success',
        };
        try {
            const seedsDir = this.resolveSeedsDir();
            const categories = this.readCsv(seedsDir, 'lis_dictionary_categories.csv');
            const entries = this.readCsv(seedsDir, 'lis_dictionary_entries.csv');
            const attributeByOpenelisId = new Map();
            for (const row of categories) {
                const code = row.code?.trim();
                if (!code)
                    continue;
                let attribute = await this.attributeRepository.findOne({
                    where: { concept: concept_enum_1.CodingConcept.DICTIONARY, code },
                });
                if (!attribute) {
                    try {
                        attribute = await this.attributeRepository.save(this.attributeRepository.create({
                            concept: concept_enum_1.CodingConcept.DICTIONARY,
                            code,
                            name: row.name || code,
                            dataType: 'coded',
                            isRequired: false,
                            isMultiValued: false,
                            isSearchable: true,
                            isFilterable: true,
                            description: row.description || row.localAbbrev || undefined,
                        }));
                        stats.attributesCreated += 1;
                    }
                    catch (err) {
                        if (err?.code !== '23505')
                            throw err;
                        attribute = await this.attributeRepository.findOne({
                            where: { concept: concept_enum_1.CodingConcept.DICTIONARY, code },
                        });
                    }
                }
                if (attribute)
                    attributeByOpenelisId.set(row.openelisId?.trim(), attribute);
            }
            for (const row of entries) {
                const code = row.code?.trim();
                if (!code)
                    continue;
                const dictEntry = row.dictEntry?.trim() || code;
                const name = dictEntry.length > 255 ? dictEntry.slice(0, 255) : dictEntry;
                const longDescription = dictEntry.length > 500 ? dictEntry.slice(0, 500) : dictEntry;
                const existing = await this.conceptCodeRepository.findOne({
                    where: { concept: concept_enum_1.CodingConcept.DICTIONARY, code },
                });
                let conceptCode;
                if (existing) {
                    conceptCode = existing;
                }
                else {
                    try {
                        conceptCode = await this.conceptCodeRepository.save(this.conceptCodeRepository.create({
                            concept: concept_enum_1.CodingConcept.DICTIONARY,
                            code,
                            name,
                            shortName: row.localAbbrev?.trim() || undefined,
                            shortDescription: name,
                            longDescription,
                        }));
                        stats.codesCreated += 1;
                    }
                    catch (err) {
                        if (err?.code !== '23505')
                            throw err;
                        const reloaded = await this.conceptCodeRepository.findOne({
                            where: { concept: concept_enum_1.CodingConcept.DICTIONARY, code },
                        });
                        if (!reloaded)
                            throw err;
                        conceptCode = reloaded;
                    }
                }
                const categoryAttr = attributeByOpenelisId.get(row.dictionaryCategoryId?.trim());
                if (!categoryAttr)
                    continue;
                const existingValue = await this.valueRepository.findOne({
                    where: {
                        conceptCode: { id: conceptCode.id },
                        attribute: { id: categoryAttr.id },
                    },
                });
                if (existingValue)
                    continue;
                try {
                    await this.valueRepository.save(this.valueRepository.create({
                        conceptCode,
                        concept: concept_enum_1.CodingConcept.DICTIONARY,
                        attribute: categoryAttr,
                        value: dictEntry,
                        valueFormat: 'coded',
                    }));
                    stats.valuesCreated += 1;
                }
                catch (err) {
                    if (err?.code !== '23505')
                        throw err;
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
            this.logger.log(`Dictionary import completed: ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values`);
            return {
                success: true,
                message: `Successfully imported dictionary. Created ${stats.codesCreated} codes, ${stats.attributesCreated} attributes, ${stats.valuesCreated} values.`,
                stats,
                tracking,
            };
        }
        catch (error) {
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
    resolveSeedsDir() {
        for (const candidate of SEEDS_CANDIDATES) {
            if ((0, fs_1.existsSync)(candidate) &&
                (0, fs_1.existsSync)((0, path_1.join)(candidate, 'lis_dictionary_categories.csv'))) {
                return candidate;
            }
        }
        return SEEDS_CANDIDATES[0];
    }
    readCsv(dir, filename) {
        const content = (0, fs_1.readFileSync)((0, path_1.join)(dir, filename), 'utf-8');
        return (0, sync_1.parse)(content, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
        });
    }
};
exports.DictionarySeederService = DictionarySeederService;
exports.DictionarySeederService = DictionarySeederService = DictionarySeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ConceptCodingEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeValueEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.ImportTrackingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DictionarySeederService);
//# sourceMappingURL=dictionary.seeder.js.map