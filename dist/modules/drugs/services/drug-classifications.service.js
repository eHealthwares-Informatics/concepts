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
exports.DrugClassificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
function toType(entity) {
    return { id: entity.id, code: entity.code, type: entity.type, name: entity.name };
}
let DrugClassificationsService = class DrugClassificationsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    allowSort = new Set(['code', 'type', 'name', 'created_at', 'updated_at']);
    async list(query) {
        const sortBy = this.allowSort.has(query.sortBy ?? '') ? query.sortBy : 'name';
        const qb = this.repo
            .createQueryBuilder('dc')
            .where('dc.deleted_at IS NULL')
            .orderBy(`dc.${sortBy}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.type)
            qb.andWhere('dc.type = :type', { type: query.type });
        if (query.search) {
            qb.andWhere('(dc.code ILIKE :s OR dc.name ILIKE :s)', { s: `%${query.search}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toType), total };
    }
    async getByCode(code) {
        const item = await this.repo.findOne({ where: { code, deletedAt: (0, typeorm_2.IsNull)() } });
        if (!item)
            throw new common_1.NotFoundException('Drug classification not found');
        return toType(item);
    }
    async get(id) {
        const item = await this.repo.findOne({ where: { id, deletedAt: (0, typeorm_2.IsNull)() } });
        if (!item)
            throw new common_1.NotFoundException('Drug classification not found');
        return toType(item);
    }
    async getRelations(id) {
        const item = await this.repo.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { genericDrugs: true, genericProducts: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Drug classification not found');
        return {
            genericDrugs: (item.genericDrugs ?? []).map((d) => ({ id: d.id, code: d.code, name: d.name })),
            genericProducts: (item.genericProducts ?? []).map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
            })),
        };
    }
};
exports.DrugClassificationsService = DrugClassificationsService;
exports.DrugClassificationsService = DrugClassificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.DrugClassificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DrugClassificationsService);
//# sourceMappingURL=drug-classifications.service.js.map