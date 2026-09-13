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
exports.LocalitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const list_1 = require("../../concepts/repository/list");
function toLocalityType(e) {
    return {
        id: e.id,
        code: e.code,
        type: e.type,
        name: e.name,
        gazetteerWardCode: e.gazetteerWardCode,
        lon: e.lon === null ? null : Number(e.lon),
        lat: e.lat === null ? null : Number(e.lat),
        pharmacyCount: e.pharmacyCount,
        source: e.source,
        confidence: e.confidence,
    };
}
let LocalitiesService = class LocalitiesService {
    localityRepo;
    relationRepo;
    constructor(localityRepo, relationRepo) {
        this.localityRepo = localityRepo;
        this.relationRepo = relationRepo;
    }
    async list(query) {
        const page = Math.max(Number(query.page || 1), 1);
        const limit = Math.min(Math.max(Number(query.limit || 20), 1), 200);
        const qb = this.localityRepo.createQueryBuilder('locality');
        if (query.type) {
            qb.andWhere('locality.type = :type', { type: query.type });
        }
        const search = query.search?.trim();
        if (search) {
            qb.andWhere('locality.name ILIKE :s', { s: `%${search}%` });
        }
        (0, list_1.applyFilters)(qb, 'locality', query.filters ?? {});
        const [rows, total] = await qb
            .orderBy('locality.name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { data: rows.map(toLocalityType), total, page, limit };
    }
    async get(id) {
        const row = await this.localityRepo.findOne({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Locality not found');
        return toLocalityType(row);
    }
    async nearby(id, limit = 50) {
        const exists = await this.localityRepo.findOne({ where: { id }, select: ['id'] });
        if (!exists)
            throw new common_1.NotFoundException('Locality not found');
        const rows = await this.relationRepo
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.relatedLocality', 'related')
            .where('relation.locality_id = :id', { id })
            .andWhere('relation.kind = :kind', { kind: 'nearby' })
            .getMany();
        const rank = { ward: 0, lga: 1, coord: 2 };
        rows.sort((a, b) => {
            const ra = rank[a.tier ?? 'coord'] ?? 3;
            const rb = rank[b.tier ?? 'coord'] ?? 3;
            if (ra !== rb)
                return ra - rb;
            const da = a.distanceKm === null ? Number.MAX_SAFE_INTEGER : Number(a.distanceKm);
            const db = b.distanceKm === null ? Number.MAX_SAFE_INTEGER : Number(b.distanceKm);
            if (da !== db)
                return da - db;
            return (a.relatedLocality?.name ?? '').localeCompare(b.relatedLocality?.name ?? '');
        });
        return rows.slice(0, Math.min(Math.max(limit, 1), 200)).map((r) => ({
            tier: r.tier,
            distanceKm: r.distanceKm === null ? null : Number(r.distanceKm),
            locality: r.relatedLocality ? toLocalityType(r.relatedLocality) : null,
        }));
    }
};
exports.LocalitiesService = LocalitiesService;
exports.LocalitiesService = LocalitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.LocalityEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.LocalityRelationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LocalitiesService);
//# sourceMappingURL=localities.service.js.map