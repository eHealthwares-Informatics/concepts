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
exports.DiagnosticCentersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const list_1 = require("../../concepts/repository/list");
function toGeoRef(e) {
    return e ? { id: e.id, code: e.code, name: e.name } : null;
}
function toCenterType(e) {
    return {
        id: e.id,
        code: e.code,
        name: e.name,
        address: e.address,
        description: e.description,
        stateName: e.stateName,
        lgaName: e.lgaName,
        openHours: e.openHours,
        rating: e.rating,
        providerId: e.providerId,
        sourceUrl: e.sourceUrl,
        state: toGeoRef(e.state),
        lga: toGeoRef(e.lga),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
    };
}
let DiagnosticCentersService = class DiagnosticCentersService {
    centerRepo;
    constructor(centerRepo) {
        this.centerRepo = centerRepo;
    }
    baseQuery() {
        return this.centerRepo
            .createQueryBuilder('center')
            .leftJoinAndSelect('center.state', 'state')
            .leftJoinAndSelect('center.lga', 'lga');
    }
    async list(query) {
        const page = Math.max(Number(query.page || 1), 1);
        const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
        const qb = this.baseQuery();
        const search = query.search?.trim();
        if (search) {
            qb.andWhere('(center.name ILIKE :s OR center.address ILIKE :s OR center.description ILIKE :s OR center.lgaName ILIKE :s)', { s: `%${search}%` });
        }
        (0, list_1.applyFilters)(qb, 'center', query.filters ?? {});
        const [rows, total] = await qb
            .orderBy('center.name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { data: rows.map(toCenterType), total, page, limit };
    }
    async get(id) {
        const row = await this.baseQuery().where('center.id = :id', { id }).getOne();
        if (!row)
            throw new common_1.NotFoundException('Diagnostic center not found');
        return toCenterType(row);
    }
    async nearby(id, limit = 50) {
        const center = await this.centerRepo.findOne({
            where: { id },
            select: ['id', 'lgaId', 'stateId'],
        });
        if (!center)
            throw new common_1.NotFoundException('Diagnostic center not found');
        const sameLga = center.lgaId
            ? await this.baseQuery()
                .where('center.lga_id = :lgaId', { lgaId: center.lgaId })
                .andWhere('center.id != :id', { id })
                .orderBy('center.name', 'ASC')
                .getMany()
            : [];
        const lgaIds = new Set(sameLga.map((row) => row.id));
        const sameState = center.stateId
            ? (await this.baseQuery()
                .where('center.state_id = :stateId', { stateId: center.stateId })
                .andWhere('center.id != :id', { id })
                .orderBy('center.name', 'ASC')
                .getMany()).filter((row) => !lgaIds.has(row.id))
            : [];
        return [
            ...sameLga.map((row) => ({ ...toCenterType(row), nearbyTier: 'lga' })),
            ...sameState.map((row) => ({ ...toCenterType(row), nearbyTier: 'state' })),
        ].slice(0, Math.min(Math.max(limit, 1), 200));
    }
};
exports.DiagnosticCentersService = DiagnosticCentersService;
exports.DiagnosticCentersService = DiagnosticCentersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.DiagnosticCenterEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DiagnosticCentersService);
//# sourceMappingURL=diagnostic-centers.service.js.map