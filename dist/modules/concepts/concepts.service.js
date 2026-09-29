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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("./entities");
const list_1 = require("./repository/list");
let ConceptsService = class ConceptsService {
    conceptCodeRepository;
    conceptAttributeRepository;
    conceptValueRepository;
    externalMappingRepository;
    constructor(conceptCodeRepository, conceptAttributeRepository, conceptValueRepository, externalMappingRepository) {
        this.conceptCodeRepository = conceptCodeRepository;
        this.conceptAttributeRepository = conceptAttributeRepository;
        this.conceptValueRepository = conceptValueRepository;
        this.externalMappingRepository = externalMappingRepository;
    }
    async createCode(payload) {
        const entity = this.conceptCodeRepository.create(payload);
        return this.conceptCodeRepository.save(entity);
    }
    async uploadCodes(payload) {
        return this.conceptCodeRepository.save(payload.map((item) => this.conceptCodeRepository.create(item)));
    }
    async addConcept(payload) {
        const created = await this.createCode(payload.code);
        if (payload.conceptValues?.length) {
            await this.uploadConceptValues(payload.conceptValues.map((value) => ({
                ...value,
                entity: created.id,
                concept: value.concept || created.concept,
            })));
        }
        if (payload.externalMappings?.length) {
            await Promise.all(payload.externalMappings.map((mapping) => this.createExternalMapping({
                ...mapping,
                conceptCodeId: created.id,
                internalConcept: mapping.internalConcept || created.concept,
                internalCode: mapping.internalCode || created.code,
            })));
        }
        return this.getConcept(created.id);
    }
    async listConcepts(query) {
        const qb = this.conceptCodeRepository.createQueryBuilder('concept');
        return (0, list_1.executeListQuery)(qb, 'concept', query);
    }
    parseFilter(value) {
        const [type, rawValue, rawValueTo] = value.split(':');
        return {
            type,
            value: rawValue || undefined,
            valueTo: rawValueTo || undefined,
        };
    }
    async getConcept(id) {
        const concept = await this.conceptCodeRepository.findOne({
            where: { id },
            relations: ['conceptValues', 'externalMappings'],
        });
        if (!concept) {
            throw new common_1.NotFoundException(`Concept not found: ${id}`);
        }
        return concept;
    }
    async updateConcept(id, payload) {
        await this.conceptCodeRepository.update(id, payload);
        return this.getConcept(id);
    }
    async deleteConcept(id) {
        await this.conceptCodeRepository.delete(id);
        return { success: true };
    }
    async uploadConceptValues(payload) {
        return this.conceptValueRepository.save(payload.map((item) => this.conceptValueRepository.create(item)));
    }
    async createConceptValue(payload) {
        const entity = this.conceptValueRepository.create(payload);
        return this.conceptValueRepository.save(entity);
    }
    async listConceptValues(query) {
        const page = Math.max(Number(query.page || 1), 1);
        const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
        const qb = this.conceptValueRepository
            .createQueryBuilder('cv');
        const result = await (0, list_1.executeListQuery)(qb, 'cv', query);
        return result;
    }
    async listConceptAttributes(query) {
        const qb = this.conceptAttributeRepository
            .createQueryBuilder('ca');
        const result = await (0, list_1.executeListQuery)(qb, 'ca', query);
        return result;
    }
    async updateConceptValue(id, payload) {
        await this.conceptValueRepository.update(id, payload);
        return this.conceptValueRepository.findOne({ where: { id } });
    }
    async deleteConceptValue(id) {
        await this.conceptValueRepository.delete(id);
        return { success: true };
    }
    async createExternalMapping(payload) {
        const entity = this.externalMappingRepository.create(payload);
        return this.externalMappingRepository.save(entity);
    }
    async listExternalMappings(query) {
        const page = Math.max(Number(query.page || 1), 1);
        const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
        const where = {};
        if (query.externalConcept) {
            where.externalConcept = query.externalConcept;
        }
        if (query.internalConcept) {
            where.internalConcept = query.internalConcept;
        }
        if (query.externalCode) {
            where.externalCode = (0, typeorm_2.ILike)(`%${query.externalCode}%`);
        }
        const [data, total] = await this.externalMappingRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const meta = this.buildMeta(page, limit, total);
        return {
            data,
            pagination: meta,
            meta,
        };
    }
    async updateExternalMapping(id, payload) {
        await this.externalMappingRepository.update(id, payload);
        return this.externalMappingRepository.findOne({ where: { id } });
    }
    async deleteExternalMapping(id) {
        await this.externalMappingRepository.delete(id);
        return { success: true };
    }
    async searchConcept(concept, conceptCode, metadata = false) {
        const conceptCoding = await this.conceptCodeRepository.findOne({
            where: [
                { concept: concept, code: conceptCode },
                { concept: concept, shortName: (0, typeorm_2.ILike)(`%${conceptCode}%`) },
                { concept: concept, longName: (0, typeorm_2.ILike)(`%${conceptCode}%`) },
            ],
            relations: ['conceptValues', 'externalMappings'],
            order: { createdAt: 'ASC' },
        });
        if (!conceptCoding) {
            throw new common_1.NotFoundException(`No concept found for concept ${concept} and search term ${conceptCode} `);
        }
        return this.formatConceptResponse(conceptCoding, metadata);
    }
    async matchConcepts(concept, conceptCode, metadata = false) {
        const concepts = await this.conceptCodeRepository.find({
            where: [
                { concept: concept, code: (0, typeorm_2.ILike)(`%${conceptCode}%`) },
                { concept: concept, shortName: (0, typeorm_2.ILike)(`%${conceptCode}%`) },
                { concept: concept, longName: (0, typeorm_2.ILike)(`%${conceptCode}%`) },
            ],
            relations: ['conceptValues', 'externalMappings'],
            order: { shortName: 'ASC', code: 'ASC' },
        });
        return concepts.map((concept) => this.formatConceptResponse(concept, metadata));
    }
    formatConceptResponse(concept, metadata) {
        return {
            id: concept.id,
            concept: concept.concept,
            code: concept.code,
            shortName: concept.shortName,
            fullName: concept.longName,
            shortDescription: concept.shortDescription,
            fullDescription: concept.longDescription,
            externalMappings: concept.externalMappings || [],
            ...(metadata
                ? {
                    metadata: (concept.conceptValues || []).reduce((accumulator, value) => {
                        accumulator[value.attribute.code] = {
                            attributeId: value.attribute.id,
                            attributeCode: value.attribute.code,
                            attributeName: value.attribute.name,
                            attributeValue: value.value,
                            valueFormat: value.valueFormat,
                        };
                        return accumulator;
                    }, {}),
                }
                : {}),
        };
    }
    buildMeta(page, limit, total) {
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.ConceptsService = ConceptsService;
exports.ConceptsService = ConceptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ConceptCodingEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeValueEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.ExternalConceptMappingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConceptsService);
//# sourceMappingURL=concepts.service.js.map