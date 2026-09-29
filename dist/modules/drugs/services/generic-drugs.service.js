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
exports.GenericDrugsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
function toDrugClassificationType(c) {
    return { id: c.id, code: c.code, type: c.type, name: c.name };
}
function toGenericDrugType(entity) {
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        genericClass: entity.genericClass,
        pharmaceuticalClass: entity.pharmaceuticalClass,
        emdexCode: entity.emdexCode,
        source: entity.source,
        classifications: (entity.classifications ?? []).map(toDrugClassificationType),
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
    };
}
let GenericDrugsService = class GenericDrugsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async list(query) {
        const qb = this.repo
            .createQueryBuilder('gd')
            .where('gd.deleted_at IS NULL')
            .orderBy(`gd.${query.sortBy ?? 'name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('(gd.code ILIKE :s OR gd.name ILIKE :s OR gd.generic_class ILIKE :s)', {
                s: `%${query.search}%`,
            });
        }
        const [data, total] = await qb.getManyAndCount();
        await this.withClassifications(data);
        return { data: data.map(toGenericDrugType), total };
    }
    async getByCode(code) {
        const item = await this.repo.findOne({ where: { code, deletedAt: (0, typeorm_2.IsNull)() }, relations: { classifications: true } });
        if (!item)
            throw new common_1.NotFoundException('Generic drug not found');
        return toGenericDrugType(item);
    }
    async get(id) {
        const item = await this.repo.findOne({ where: { id, deletedAt: (0, typeorm_2.IsNull)() }, relations: { classifications: true } });
        if (!item)
            throw new common_1.NotFoundException('Generic drug not found');
        return toGenericDrugType(item);
    }
    async withClassifications(entities) {
        if (!entities.length)
            return;
        const ids = entities.map((e) => e.id);
        const rows = await this.repo
            .createQueryBuilder('gd')
            .leftJoinAndSelect('gd.classifications', 'c')
            .where('gd.id IN (:...ids)', { ids })
            .getMany();
        const byId = new Map(rows.map((r) => [r.id, r.classifications ?? []]));
        for (const ent of entities)
            ent.classifications = byId.get(ent.id) ?? [];
    }
};
exports.GenericDrugsService = GenericDrugsService;
exports.GenericDrugsService = GenericDrugsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.GenericDrugEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GenericDrugsService);
//# sourceMappingURL=generic-drugs.service.js.map