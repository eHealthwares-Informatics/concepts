import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { ManufacturerType } from '../types/drugs.types';
import { CreateManufacturerDto, ListManufacturersDto, UpdateManufacturerDto } from '../dto/manufacturers.dto';
import { ManufacturerEntity } from '../entities';

const toManufacturerType = (entity: ManufacturerEntity): ManufacturerType => ({
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

@Injectable()
export class ManufacturersService {
  constructor(
    @InjectRepository(ManufacturerEntity)
    private readonly manufacturerRepository: Repository<ManufacturerEntity>,
  ) {}

  async list(query: ListManufacturersDto): Promise<{ data: ManufacturerType[]; total: number }> {
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

  async get(id: string): Promise<ManufacturerType> {
    const item = await this.manufacturerRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Manufacturer not found');
    return toManufacturerType(item);
  }

  async create(payload: CreateManufacturerDto): Promise<ManufacturerType> {
    const duplicate = await this.manufacturerRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Manufacturer code already exists');

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

  async update(id: string, payload: UpdateManufacturerDto): Promise<ManufacturerType> {
    const item = await this.manufacturerRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!item) throw new NotFoundException('Manufacturer not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.manufacturerRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Manufacturer code already exists');
      item.code = payload.code;
    }
    if (payload.name !== undefined) item.name = payload.name;
    if (payload.country !== undefined) item.country = payload.country;
    if (payload.phone !== undefined) item.phone = payload.phone;
    if (payload.email !== undefined) item.email = payload.email;
    if (payload.website !== undefined) item.website = payload.website;
    if (payload.address !== undefined) item.address = payload.address;

    const saved = await this.manufacturerRepository.save(item);
    return toManufacturerType(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.manufacturerRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Manufacturer not found');
  }
}
