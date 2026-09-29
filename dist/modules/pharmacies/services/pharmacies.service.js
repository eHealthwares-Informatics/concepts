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
exports.PharmaciesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const entities_2 = require("../../localities/entities");
const list_1 = require("../../concepts/repository/list");
const NEARBY_TIER_RANK = {
    area: 0,
    ward: 0,
    lga: 1,
    coord: 2,
};
function toLocalityRef(e) {
    return e ? { id: e.id, code: e.code, name: e.name, type: e.type } : null;
}
function toPharmacyType(e) {
    return {
        id: e.id,
        premisesId: e.premisesId,
        premisesName: e.premisesName,
        premisesAddress: e.premisesAddress,
        premisesState: e.premisesState,
        pharmacistId: e.pharmacistId,
        pharmacistFirstName: e.pharmacistFirstName,
        pharmacistMiddleName: e.pharmacistMiddleName,
        pharmacistLastName: e.pharmacistLastName,
        pharmacist: e.pharmacist,
        stateCode: e.stateCode,
        stateName: e.stateName,
        lgaName: e.lgaName,
        lgaCode: e.lgaCode,
        wardName: e.wardName,
        wardCode: e.wardCode,
        area: e.area,
        neighbourhood: e.neighbourhood,
        settlement: e.settlement,
        settlementCode: e.settlementCode,
        stateMatch: e.stateMatch,
        certificateNo: e.certificateNo,
        category: e.category,
        yearLicenced: e.yearLicenced,
        dateApproved: e.dateApproved,
        isLicencePrinted: !!e.isLicencePrinted,
        datePrinted: e.datePrinted,
        matchedStateCode: e.matchedStateCode,
        matchedLgaCode: e.matchedLgaCode,
        matchedWardCode: e.matchedWardCode,
        lgaMatch: e.lgaMatch,
        wardMatch: e.wardMatch,
        state: e.state ? { id: e.state.id, code: e.state.code, name: e.state.name } : null,
        lga: e.lga ? { id: e.lga.id, code: e.lga.code, name: e.lga.name } : null,
        ward: e.ward ? { id: e.ward.id, code: e.ward.code, name: e.ward.name } : null,
        areaLocality: toLocalityRef(e.areaLocality),
        neighbourhoodLocality: toLocalityRef(e.neighbourhoodLocality),
        settlementLocality: toLocalityRef(e.settlementLocality),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
    };
}
let PharmaciesService = class PharmaciesService {
    pharmacyRepo;
    relationRepo;
    constructor(pharmacyRepo, relationRepo) {
        this.pharmacyRepo = pharmacyRepo;
        this.relationRepo = relationRepo;
    }
    baseQuery() {
        return this.pharmacyRepo
            .createQueryBuilder('pharmacy')
            .leftJoinAndSelect('pharmacy.state', 'state')
            .leftJoinAndSelect('pharmacy.lga', 'lga')
            .leftJoinAndSelect('pharmacy.ward', 'ward')
            .leftJoinAndSelect('pharmacy.areaLocality', 'area')
            .leftJoinAndSelect('pharmacy.neighbourhoodLocality', 'neighbourhood')
            .leftJoinAndSelect('pharmacy.settlementLocality', 'settlement');
    }
    async list(query) {
        const page = Math.max(Number(query.page || 1), 1);
        const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
        const qb = this.baseQuery();
        const search = query.search?.trim();
        if (search) {
            qb.andWhere('(pharmacy.premisesName ILIKE :s OR pharmacy.pharmacist ILIKE :s OR pharmacy.certificateNo ILIKE :s OR pharmacy.premisesAddress ILIKE :s)', { s: `%${search}%` });
        }
        (0, list_1.applyFilters)(qb, 'pharmacy', query.filters ?? {});
        const [rows, total] = await qb
            .orderBy('pharmacy.premisesName', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { data: rows.map(toPharmacyType), total, page, limit };
    }
    async get(id) {
        const row = await this.baseQuery().where('pharmacy.id = :id', { id }).getOne();
        if (!row)
            throw new common_1.NotFoundException('Pharmacy not found');
        return toPharmacyType(row);
    }
    async findNearby(lat, lng, radiusKm, limit) {
        const rows = await this.pharmacyRepo
            .createQueryBuilder('pharmacy')
            .leftJoin('pharmacy.lga', 'l')
            .leftJoin('pharmacy.areaLocality', 'a')
            .select('pharmacy.id', 'id')
            .addSelect('pharmacy.premisesId', 'premisesId')
            .addSelect('pharmacy.premisesName', 'premisesName')
            .addSelect('pharmacy.premisesAddress', 'premisesAddress')
            .addSelect('pharmacy."settlementY"', 'lat')
            .addSelect('pharmacy."settlementX"', 'lng')
            .addSelect('pharmacy.pharmacist', 'pharmacist')
            .addSelect('pharmacy.category', 'category')
            .addSelect('pharmacy."certificateNo"', 'certificate_no')
            .addSelect('pharmacy."stateName"', 'state_name')
            .addSelect('pharmacy."wardName"', 'ward_name')
            .addSelect('l.name', 'lga_name')
            .addSelect('a.name', 'area_name')
            .addSelect(`(6371 * acos(least(1.0, greatest(-1.0,
          cos(radians(:plat)) * cos(radians("settlementY"::double precision))
          * cos(radians("settlementX"::double precision) - radians(:plng))
          + sin(radians(:plat)) * sin(radians("settlementY"::double precision))
        ))))`, 'distance_km')
            .setParameter('plat', lat)
            .setParameter('plng', lng)
            .andWhere("pharmacy.\"settlementY\" ~ '^[0-9]+(\\.[0-9]+)?$'")
            .andWhere("pharmacy.\"settlementX\" ~ '^[0-9]+(\\.[0-9]+)?$'")
            .orderBy('distance_km', 'ASC')
            .limit(limit)
            .getRawMany();
        return rows
            .map((r) => ({
            id: String(r.id),
            premisesId: String(r.premisesId),
            premisesName: r.premisesName != null ? String(r.premisesName) : null,
            premisesAddress: r.premisesAddress != null ? String(r.premisesAddress) : null,
            latitude: Number(r.lat),
            longitude: Number(r.lng),
            distanceKm: Math.round(Number(r.distance_km) * 10) / 10,
            pharmacist: r.pharmacist != null ? String(r.pharmacist) : null,
            category: r.category != null ? String(r.category) : null,
            certificateNo: r.certificate_no != null ? String(r.certificate_no) : null,
            stateName: r.state_name != null ? String(r.state_name) : null,
            lgaName: r.lga_name != null ? String(r.lga_name) : null,
            wardName: r.ward_name != null ? String(r.ward_name) : null,
            areaName: r.area_name != null ? String(r.area_name) : null,
        }))
            .filter((r) => r.distanceKm <= radiusKm);
    }
    async nearby(id, limit = 50) {
        const pharmacy = await this.pharmacyRepo.findOne({
            where: { id },
            select: ['id', 'areaId'],
        });
        if (!pharmacy)
            throw new common_1.NotFoundException('Pharmacy not found');
        if (!pharmacy.areaId)
            return [];
        const ranking = new Map();
        ranking.set(pharmacy.areaId, { tier: 'area', distanceKm: 0 });
        const edges = await this.relationRepo
            .createQueryBuilder('relation')
            .where('relation.locality_id = :id', { id: pharmacy.areaId })
            .andWhere('relation.kind = :kind', { kind: 'nearby' })
            .getMany();
        for (const edge of edges) {
            if (!edge.relatedLocalityId || ranking.has(edge.relatedLocalityId))
                continue;
            ranking.set(edge.relatedLocalityId, {
                tier: edge.tier ?? 'coord',
                distanceKm: edge.distanceKm === null ? null : Number(edge.distanceKm),
            });
        }
        const rows = await this.baseQuery()
            .where('pharmacy.area_id IN (:...ids)', { ids: [...ranking.keys()] })
            .andWhere('pharmacy.id != :id', { id })
            .getMany();
        const rankOf = (areaId) => areaId ? NEARBY_TIER_RANK[ranking.get(areaId)?.tier ?? 'coord'] ?? 3 : 3;
        rows.sort((a, b) => {
            const ra = rankOf(a.areaId);
            const rb = rankOf(b.areaId);
            if (ra !== rb)
                return ra - rb;
            const da = ranking.get(a.areaId ?? '')?.distanceKm ?? Number.MAX_SAFE_INTEGER;
            const db = ranking.get(b.areaId ?? '')?.distanceKm ?? Number.MAX_SAFE_INTEGER;
            if (da !== db)
                return da - db;
            return (a.premisesName ?? '').localeCompare(b.premisesName ?? '');
        });
        return rows.slice(0, Math.min(Math.max(limit, 1), 200)).map((row) => {
            const rank = row.areaId ? ranking.get(row.areaId) : undefined;
            return {
                ...toPharmacyType(row),
                nearbyTier: rank?.tier ?? null,
                nearbyDistanceKm: rank?.distanceKm ?? null,
            };
        });
    }
};
exports.PharmaciesService = PharmaciesService;
exports.PharmaciesService = PharmaciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.PharmacyEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_2.LocalityRelationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PharmaciesService);
//# sourceMappingURL=pharmacies.service.js.map