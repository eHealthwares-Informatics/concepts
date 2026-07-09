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
exports.ConceptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const concepts_service_1 = require("./concepts.service");
const loinc_seeder_1 = require("./seeders/loinc.seeder");
const icd_seeder_1 = require("./seeders/icd.seeder");
let ConceptsController = class ConceptsController {
    conceptsService;
    loincSeeder;
    icdSeeder;
    constructor(conceptsService, loincSeeder, icdSeeder) {
        this.conceptsService = conceptsService;
        this.loincSeeder = loincSeeder;
        this.icdSeeder = icdSeeder;
    }
    async addConcept(payload) {
        return {
            data: await this.conceptsService.addConcept(payload),
        };
    }
    async createCode(payload) {
        return {
            data: await this.conceptsService.createCode(payload),
        };
    }
    async uploadCodes(payload) {
        return {
            data: await this.conceptsService.uploadCodes(payload),
        };
    }
    async createConceptValue(payload) {
        return {
            data: await this.conceptsService.createConceptValue(payload),
        };
    }
    async uploadConceptValues(payload) {
        return {
            data: await this.conceptsService.uploadConceptValues(payload),
        };
    }
    async listConcepts(query, page, limit) {
        const { page: _, limit: __, ...filters } = query;
        return this.conceptsService.listConcepts({
            page: Number(page || 1),
            limit: Number(limit || 20),
            filters,
        });
    }
    async searchConcept(concept, conceptCode, metadata) {
        return {
            data: await this.conceptsService.searchConcept(concept, conceptCode, metadata === 'true'),
        };
    }
    async matchConcepts(concept, conceptCode, metadata) {
        return {
            data: await this.conceptsService.matchConcepts(concept, conceptCode, metadata === 'true'),
        };
    }
    async listValues(query, page, limit) {
        const { page: _, limit: __, ...filters } = query;
        return this.conceptsService.listConceptValues({
            page: Number(page || 1),
            limit: Number(limit || 20),
            filters
        });
    }
    async listConceptAttributes(query, page, concept, limit) {
        const { page: _, limit: __, ...filters } = query;
        return this.conceptsService.listConceptAttributes({
            page: Number(page || 1),
            limit: Number(limit || 20),
            filters
        });
    }
    async updateValue(id, payload) {
        return {
            data: await this.conceptsService.updateConceptValue(id, payload),
        };
    }
    async deleteValue(id) {
        return this.conceptsService.deleteConceptValue(id);
    }
    async createMapping(payload) {
        return {
            data: await this.conceptsService.createExternalMapping(payload),
        };
    }
    async listMappings(page, limit, externalConcept, externalCode, internalConcept) {
        return this.conceptsService.listExternalMappings({
            page: Number(page || 1),
            limit: Number(limit || 20),
            externalConcept,
            externalCode,
            internalConcept,
        });
    }
    async updateMapping(id, payload) {
        return {
            data: await this.conceptsService.updateExternalMapping(id, payload),
        };
    }
    async deleteMapping(id) {
        return this.conceptsService.deleteExternalMapping(id);
    }
    async getConcept(id) {
        return {
            data: await this.conceptsService.getConcept(id),
        };
    }
    async updateConcept(id, payload) {
        return {
            data: await this.conceptsService.updateConcept(id, payload),
        };
    }
    async deleteConcept(id) {
        return this.conceptsService.deleteConcept(id);
    }
    async seedLoinc(triggeredBy) {
        return this.loincSeeder.seedLoincData(triggeredBy || 'manual');
    }
    async getLoincImportHistory(limit) {
        return {
            data: await this.loincSeeder.getImportHistory(Math.min(Math.max(Number(limit || 10), 1), 100)),
        };
    }
    async getLoincImportStatus() {
        return {
            data: await this.loincSeeder.getLatestImportStatus(),
        };
    }
    async seedICD(triggeredBy) {
        return this.icdSeeder.seedICDData(triggeredBy || 'manual');
    }
    async getICDImportHistory(limit) {
        return {
            data: await this.icdSeeder.getImportHistory(Math.min(Math.max(Number(limit || 10), 1), 100)),
        };
    }
    async getICDImportStatus() {
        return {
            data: await this.icdSeeder.getLatestImportStatus(),
        };
    }
};
exports.ConceptsController = ConceptsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a concept' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                code: { concept: 'LOINC', code: '1234-5' },
                conceptValues: [],
                externalMappings: [],
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Concept created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "addConcept", null);
__decorate([
    (0, common_1.Post)('codes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "createCode", null);
__decorate([
    (0, common_1.Post)('upload/codes'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upload codes' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "uploadCodes", null);
__decorate([
    (0, common_1.Post)('values'),
    (0, swagger_1.ApiOperation)({ summary: 'Create concept value' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "createConceptValue", null);
__decorate([
    (0, common_1.Post)('upload/values'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upload concept values' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "uploadConceptValues", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List concepts' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "listConcepts", null);
__decorate([
    (0, common_1.Get)('search/:concept/:conceptCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Search concept by concept and code' }),
    (0, swagger_1.ApiParam)({ name: 'concept' }),
    (0, swagger_1.ApiParam)({ name: 'conceptCode' }),
    (0, swagger_1.ApiQuery)({ name: 'metadata', required: false }),
    __param(0, (0, common_1.Param)('concept')),
    __param(1, (0, common_1.Param)('conceptCode')),
    __param(2, (0, common_1.Query)('metadata')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "searchConcept", null);
__decorate([
    (0, common_1.Get)('match/:concept/:conceptCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Match concepts across concepts' }),
    __param(0, (0, common_1.Param)('concept')),
    __param(1, (0, common_1.Param)('conceptCode')),
    __param(2, (0, common_1.Query)('metadata')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "matchConcepts", null);
__decorate([
    (0, common_1.Get)('values'),
    (0, swagger_1.ApiOperation)({ summary: 'List concept values' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "listValues", null);
__decorate([
    (0, common_1.Get)('attributes/:concept'),
    (0, swagger_1.ApiOperation)({ summary: 'List concept values' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('concept')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "listConceptAttributes", null);
__decorate([
    (0, common_1.Put)('values/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update concept value' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "updateValue", null);
__decorate([
    (0, common_1.Delete)('values/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete concept value' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "deleteValue", null);
__decorate([
    (0, common_1.Post)('mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create external mapping' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "createMapping", null);
__decorate([
    (0, common_1.Get)('mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'List external mappings' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('externalConcept')),
    __param(3, (0, common_1.Query)('externalCode')),
    __param(4, (0, common_1.Query)('internalConcept')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "listMappings", null);
__decorate([
    (0, common_1.Put)('mappings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update external mapping' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "updateMapping", null);
__decorate([
    (0, common_1.Delete)('mappings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete external mapping' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "deleteMapping", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get concept by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "getConcept", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update concept' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "updateConcept", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete concept' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "deleteConcept", null);
__decorate([
    (0, common_1.Post)('seed/loinc'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger LOINC seed' }),
    __param(0, (0, common_1.Query)('triggeredBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "seedLoinc", null);
__decorate([
    (0, common_1.Get)('seed/loinc/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get LOINC import history' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "getLoincImportHistory", null);
__decorate([
    (0, common_1.Get)('seed/loinc/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get LOINC import status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "getLoincImportStatus", null);
__decorate([
    (0, common_1.Post)('seed/icd'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger ICD-10 seed' }),
    __param(0, (0, common_1.Query)('triggeredBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "seedICD", null);
__decorate([
    (0, common_1.Get)('seed/icd/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ICD-10 import history' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "getICDImportHistory", null);
__decorate([
    (0, common_1.Get)('seed/icd/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ICD-10 import status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConceptsController.prototype, "getICDImportStatus", null);
exports.ConceptsController = ConceptsController = __decorate([
    (0, swagger_1.ApiTags)('Concepts'),
    (0, common_1.Controller)('v1/concepts'),
    __metadata("design:paramtypes", [concepts_service_1.ConceptsService,
        loinc_seeder_1.LoincSeederService,
        icd_seeder_1.ICDSeederService])
], ConceptsController);
//# sourceMappingURL=concepts.controller.js.map