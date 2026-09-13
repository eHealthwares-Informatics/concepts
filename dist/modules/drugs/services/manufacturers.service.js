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
exports.ManufacturersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const toManufacturerType = (entity) => ({
    id: entity.id,
    code: entity.code,
    name: entity.name,
    country: entity.country,
    phone: entity.phone,
    email: entity.email,
    website: entity.website,
    address: entity.address,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});
let ManufacturersService = class ManufacturersService {
    manufacturerRepository;
    constructor(manufacturerRepository) {
        this.manufacturerRepository = manufacturerRepository;
    }
    async list(query) {
        const qb = this.manufacturerRepository
            .createQueryBuilder('manufacturer')
            .where('manufacturer.deleted_at IS NULL')
            .orderBy('manufacturer.name', 'ASC')
            .skip(query.offset)
            .take(query.limit);
        if (query.search) {
            qb.andWhere('manufacturer.name ILIKE :search', { search: `%${query.search}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(toManufacturerType), total };
    }
    async get(id) {
        const item = await this.manufacturerRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Manufacturer not found');
        return toManufacturerType(item);
    }
    async create(payload) {
        const duplicate = await this.manufacturerRepository.findOne({
            where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (duplicate)
            throw new common_1.BadRequestException('Manufacturer code already exists');
        const entity = this.manufacturerRepository.create({
            code: payload.code,
            name: payload.name,
            country: payload.country ?? null,
            phone: payload.phone ?? null,
            email: payload.email ?? null,
            website: payload.website ?? null,
            address: payload.address ?? null,
        });
        const saved = await this.manufacturerRepository.save(entity);
        return toManufacturerType(saved);
    }
    async update(id, payload) {
        const item = await this.manufacturerRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!item)
            throw new common_1.NotFoundException('Manufacturer not found');
        if (payload.code && payload.code !== item.code) {
            const duplicate = await this.manufacturerRepository.findOne({
                where: { code: payload.code, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (duplicate)
                throw new common_1.BadRequestException('Manufacturer code already exists');
            item.code = payload.code;
        }
        if (payload.name !== undefined)
            item.name = payload.name;
        if (payload.country !== undefined)
            item.country = payload.country;
        if (payload.phone !== undefined)
            item.phone = payload.phone;
        if (payload.email !== undefined)
            item.email = payload.email;
        if (payload.website !== undefined)
            item.website = payload.website;
        if (payload.address !== undefined)
            item.address = payload.address;
        const saved = await this.manufacturerRepository.save(item);
        return toManufacturerType(saved);
    }
    async remove(id) {
        const result = await this.manufacturerRepository.softDelete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException('Manufacturer not found');
    }
};
exports.ManufacturersService = ManufacturersService;
exports.ManufacturersService = ManufacturersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ManufacturerEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ManufacturersService);
//# sourceMappingURL=manufacturers.service.js.map