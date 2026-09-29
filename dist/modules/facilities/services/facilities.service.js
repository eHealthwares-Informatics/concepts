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
exports.FacilitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let FacilitiesService = class FacilitiesService {
    facilityRepository;
    stateRepository;
    wardRepository;
    lgaRepository;
    facilityTypeRepository;
    facilityLevelRepository;
    constructor(facilityRepository, stateRepository, wardRepository, lgaRepository, facilityTypeRepository, facilityLevelRepository) {
        this.facilityRepository = facilityRepository;
        this.stateRepository = stateRepository;
        this.wardRepository = wardRepository;
        this.lgaRepository = lgaRepository;
        this.facilityTypeRepository = facilityTypeRepository;
        this.facilityLevelRepository = facilityLevelRepository;
    }
    async list(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const qb = this.facilityRepository.createQueryBuilder('f')
            .leftJoinAndSelect('f.state', 's')
            .leftJoinAndSelect('f.lga', 'l')
            .leftJoinAndSelect('f.ward', 'w')
            .leftJoinAndSelect('f.facilityType', 'ft')
            .leftJoinAndSelect('f.facilityLevel', 'fl');
        if (query.code) {
            qb.andWhere('f.facilityId = :code', { code: query.code });
        }
        if (query.search) {
            qb.andWhere('(f.facilityName ILIKE :search OR f.alternativeName ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        if (query.state) {
            qb.andWhere('s.code = :stateCode', { stateCode: query.state });
        }
        if (query.ward) {
            qb.andWhere('w.code = :ward', {
                ward: query.ward,
            });
        }
        if (query.ward_name) {
            qb.andWhere('w.name ILIKE :wardName', { wardName: query.ward_name });
        }
        if (query.lga) {
            qb.andWhere('l.code = :lga', {
                lga: query.lga,
            });
        }
        if (query.facility_type) {
            qb.andWhere('ft.code = :facilityType', {
                facilityType: query.facility_type,
            });
        }
        if (query.facility_level) {
            qb.andWhere('fl.code = :facilityLevel', { facilityLevel: query.facility_level });
        }
        if (query.ownership_code) {
            qb.andWhere('f.ownershipCode = :ownershipCode', { ownershipCode: query.ownership_code });
        }
        if (query.name_like) {
            qb.andWhere('f.facilityName ILIKE :nameLike', {
                nameLike: `%${query.name_like}%`,
            });
        }
        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('f.facilityName', 'ASC')
            .getManyAndCount();
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getById(id) {
        const facility = await this.facilityRepository.findOne({
            where: { id },
            relations: ['state', 'lga', 'ward', 'facilityType', 'facilityLevel'],
        });
        if (!facility) {
            throw new common_1.NotFoundException(`Facility not found: ${id}`);
        }
        return facility;
    }
    async getByCode(code) {
        const facility = await this.facilityRepository.findOne({
            where: { facilityId: code },
            relations: ['state', 'lga', 'ward', 'facilityType', 'facilityLevel'],
        });
        if (!facility) {
            throw new common_1.NotFoundException(`Facility not found with code: ${code}`);
        }
        return facility;
    }
    async getStates() {
        return this.stateRepository.find({ order: { code: 'ASC' } });
    }
    async findNearby(lat, lng, radiusKm, limit) {
        const hav = (latExpr, lngExpr) => `(6371 * acos(least(1.0, greatest(-1.0,
        cos(radians(:plat)) * cos(radians(${latExpr})) * cos(radians(${lngExpr}) - radians(:plng))
        + sin(radians(:plat)) * sin(radians(${latExpr}))
      ))))`;
        const direct = hav('f.latitude', 'f.longitude');
        const swapped = hav('f.longitude', 'f.latitude');
        const best = `LEAST(${direct}, ${swapped})`;
        const rows = await this.nearbyRows({ lat, lng, radiusKm, limit });
        return rows;
    }
    async findNearbyFacility(facilityId, opts = {}) {
        const facility = await this.facilityRepository.findOne({
            where: { id: facilityId },
            select: ['id', 'latitude', 'longitude', 'facilityName'],
        });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        if (facility.latitude == null || facility.longitude == null)
            return [];
        return this.nearbyRows({
            lat: Number(facility.latitude),
            lng: Number(facility.longitude),
            radiusKm: opts.radiusKm ?? 25,
            limit: opts.limit ?? 50,
            nameLike: opts.nameLike,
            excludeId: facilityId,
        });
    }
    async nearbyRows(opts) {
        const { lat, lng, radiusKm, limit, nameLike, excludeId } = opts;
        const hav = (latExpr, lngExpr) => `(6371 * acos(least(1.0, greatest(-1.0,
        cos(radians(:plat)) * cos(radians(${latExpr})) * cos(radians(${lngExpr}) - radians(:plng))
        + sin(radians(:plat)) * sin(radians(${latExpr}))
      ))))`;
        const direct = hav('f.latitude', 'f.longitude');
        const swapped = hav('f.longitude', 'f.latitude');
        const best = `LEAST(${direct}, ${swapped})`;
        const qb = this.facilityRepository
            .createQueryBuilder('f')
            .leftJoin('f.state', 's')
            .leftJoin('f.lga', 'l')
            .leftJoin('f.ward', 'w')
            .leftJoin('f.facilityType', 'ft')
            .leftJoin('f.facilityLevel', 'fl')
            .select('f.id', 'id')
            .addSelect('f.facilityId', 'facilityId')
            .addSelect('f.facilityName', 'facilityName')
            .addSelect('f.latitude', 'storedLat')
            .addSelect('f.longitude', 'storedLng')
            .addSelect('f.phoneNumber', 'phone_number')
            .addSelect('f.emailAddress', 'email_address')
            .addSelect('f.website', 'website')
            .addSelect('s.code', 's_code')
            .addSelect('s.name', 's_name')
            .addSelect('l.code', 'l_code')
            .addSelect('l.name', 'l_name')
            .addSelect('w.code', 'w_code')
            .addSelect('w.name', 'w_name')
            .addSelect('ft.code', 'ft_code')
            .addSelect('ft.name', 'ft_name')
            .addSelect('fl.code', 'fl_code')
            .addSelect('fl.name', 'fl_name')
            .addSelect(`(${swapped} <= ${direct})`, 'corrected')
            .addSelect(`CASE WHEN ${swapped} <= ${direct} THEN f.longitude ELSE f.latitude END`, 'lat')
            .addSelect(`CASE WHEN ${swapped} <= ${direct} THEN f.latitude ELSE f.longitude END`, 'lng')
            .addSelect(best, 'distance_km')
            .setParameter('plat', lat)
            .setParameter('plng', lng)
            .andWhere('f.latitude IS NOT NULL AND f.longitude IS NOT NULL');
        if (nameLike) {
            qb.andWhere('f.facilityName ILIKE :nameLike', { nameLike: `%${nameLike}%` });
        }
        if (excludeId) {
            qb.andWhere('f.id != :excludeId', { excludeId });
        }
        const rows = await qb
            .orderBy('distance_km', 'ASC')
            .limit(limit)
            .getRawMany();
        return rows
            .map((r) => ({
            id: String(r.id),
            facilityId: String(r.facilityId),
            facilityName: r.facilityName != null ? String(r.facilityName) : null,
            latitude: Number(r.lat),
            longitude: Number(r.lng),
            coordinatesCorrected: Boolean(r.corrected),
            distanceKm: Math.round(Number(r.distance_km) * 10) / 10,
            state: r.s_code ? { code: String(r.s_code), name: String(r.s_name) } : null,
            lga: r.l_code ? { code: String(r.l_code), name: String(r.l_name) } : null,
            ward: r.w_code ? { code: String(r.w_code), name: String(r.w_name) } : null,
            facilityType: r.ft_code
                ? { code: String(r.ft_code), name: String(r.ft_name) }
                : null,
            facilityLevel: r.fl_code
                ? { code: String(r.fl_code), name: String(r.fl_name) }
                : null,
            phoneNumber: r.phone_number != null ? String(r.phone_number) : null,
            emailAddress: r.email_address != null ? String(r.email_address) : null,
            website: r.website != null ? String(r.website) : null,
        }))
            .filter((r) => r.distanceKm <= radiusKm);
    }
    async getCentroids(by = 'state') {
        const isState = by !== 'lga';
        const joinAlias = isState ? 'cs' : 'cl';
        const qb = this.facilityRepository
            .createQueryBuilder('f')
            .leftJoin(isState ? 'f.state' : 'f.lga', joinAlias)
            .select(`${joinAlias}.code`, 'code')
            .addSelect(`${joinAlias}.name`, 'name')
            .addSelect('AVG(f.latitude)', 'latitude')
            .addSelect('AVG(f.longitude)', 'longitude')
            .addSelect('COUNT(*)', 'facilityCount')
            .where(`${joinAlias}.id IS NOT NULL`)
            .andWhere('f.latitude IS NOT NULL')
            .andWhere('f.longitude IS NOT NULL')
            .groupBy(`${joinAlias}.id`)
            .addGroupBy(`${joinAlias}.code`)
            .addGroupBy(`${joinAlias}.name`)
            .orderBy(`${joinAlias}.name`, 'ASC');
        const rows = await qb.getRawMany();
        return rows
            .filter((r) => r.code != null)
            .map((r) => ({
            code: String(r.code),
            name: r.name != null ? String(r.name) : String(r.code),
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            facilityCount: Number(r.facilityCount ?? 0),
        }));
    }
    async getWards() {
        return this.wardRepository.find({ order: { code: 'ASC' } });
    }
    async getWardOptions(search, lgaCode, stateCode, limit = 50) {
        const qb = this.facilityRepository
            .createQueryBuilder('f')
            .innerJoin('f.ward', 'w')
            .leftJoin('f.lga', 'l')
            .leftJoin('f.state', 's')
            .select('w.name', 'name')
            .addSelect('MIN(l.code)', 'lgaCode')
            .where("w.name IS NOT NULL AND w.name <> ''")
            .groupBy('w.name')
            .orderBy("(MIN(w.name) ~ '^[0-9]+$')", 'ASC')
            .addOrderBy('w.name', 'ASC')
            .limit(Math.min(Math.max(limit, 1), 200));
        const trimmed = search?.trim();
        if (trimmed) {
            qb.andWhere('w.name ILIKE :s', { s: `%${trimmed}%` });
        }
        if (lgaCode) {
            qb.andWhere('l.code = :lgaCode', { lgaCode });
        }
        if (stateCode) {
            qb.andWhere('s.code = :stateCode', { stateCode });
        }
        const rows = await qb.getRawMany();
        return rows.map((r) => ({ name: String(r.name), lgaCode: r.lgaCode ?? null }));
    }
    async getLgas() {
        return this.lgaRepository.find({ order: { code: 'ASC' } });
    }
    async getFacilityTypes() {
        return this.facilityTypeRepository.find({ order: { code: 'ASC' } });
    }
    async getFacilityLevels() {
        return this.facilityLevelRepository.find({ order: { code: 'ASC' } });
    }
    async listFhirLocations(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const qb = this.facilityRepository
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.state', 'state')
            .leftJoinAndSelect('f.lga', 'lga')
            .leftJoinAndSelect('f.ward', 'ward')
            .leftJoinAndSelect('f.facilityType', 'facilityType')
            .leftJoinAndSelect('f.facilityLevel', 'facilityLevel');
        if (query.identifier) {
            qb.andWhere('f.facilityId = :identifier', { identifier: query.identifier });
        }
        if (query.name) {
            qb.andWhere('f.facilityName ILIKE :name', { name: `%${query.name}%` });
        }
        if (query.type) {
            qb.andWhere('facilityType.code = :type', { type: query.type });
        }
        if (query['physical-type']) {
            qb.andWhere('facilityLevel.code = :level', { level: query['physical-type'] });
        }
        if (query.ward) {
            qb.andWhere('ward.code = :ward', { ward: query.ward });
        }
        if (query.lga) {
            qb.andWhere('lga.code = :lga', { lga: query.lga });
        }
        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('f.facilityName', 'ASC')
            .getManyAndCount();
        const entries = data.map((facility) => ({
            fullUrl: `http://localhost:8004/api/v1/fhir/Location/${facility.id}`,
            resource: this.toFhirLocation(facility),
            search: {
                mode: 'match',
            },
        }));
        const bundle = {
            resourceType: 'Bundle',
            type: 'searchset',
            total,
            entry: entries,
        };
        return bundle;
    }
    async getFhirLocation(id) {
        const facility = await this.getById(id);
        return this.toFhirLocation(facility);
    }
    toFhirLocation(facility) {
        const location = {
            resourceType: 'Location',
            id: facility.id,
            identifier: [
                {
                    system: 'urn:oid:2.16.840.1.113883.3.1234',
                    value: facility.facilityId,
                },
            ],
            status: 'active',
            name: facility.facilityName || '',
            description: facility.alternativeName || undefined,
            mode: 'instance',
            type: facility.facilityType
                ? [
                    {
                        coding: [
                            {
                                system: 'urn:ietf:rfc:3986',
                                code: facility.facilityType.code,
                                display: facility.facilityType.name || '',
                            },
                        ],
                    },
                ]
                : undefined,
            address: {
                district: facility.lga?.code || undefined,
                state: facility.state?.code || undefined,
            },
            physicalType: facility.facilityLevel
                ? {
                    coding: [
                        {
                            system: 'urn:ietf:rfc:3986',
                            code: facility.facilityLevel.code,
                            display: facility.facilityLevel.name || '',
                        },
                    ],
                }
                : undefined,
            position: {
                latitude: facility.latitude ? Number(facility.latitude) : undefined,
                longitude: facility.longitude ? Number(facility.longitude) : undefined,
            },
            telecom: facility.phoneNumber
                ? [{ system: 'phone', value: facility.phoneNumber, use: 'work' }]
                : undefined,
        };
        if (facility.ward) {
            location.extension = [
                {
                    url: 'http://example.org/fhir/StructureDefinition/ward',
                    valueCode: facility.ward.code,
                    valueString: facility.ward.name || undefined,
                },
            ];
        }
        return location;
    }
};
exports.FacilitiesService = FacilitiesService;
exports.FacilitiesService = FacilitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.FacilityEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.StateEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.WardEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.LgaEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.FacilityTypeEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.FacilityLevelEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FacilitiesService);
//# sourceMappingURL=facilities.service.js.map