import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { GenericProductType } from '../types/drugs.types';
import { CreateGenericProductDto, ListGenericProductsDto, UpdateGenericProductDto } from '../dto/generic-products.dto';
import { GenericProductEntity, PharmaceuticsEntity } from '../entities';

const toGenericProductType = (entity: GenericProductEntity): GenericProductType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  therapeuticClass: entity.therapeuticClass,
  dosageForm: entity.dosageForm,
  strength: entity.strength,
  generalUse: entity.generalUse,
  adultDosage: entity.adultDosage,
  pediatricDosage: entity.pediatricDosage,
  isPrescriptionRequired: entity.isPrescriptionRequired,
  isControlledSubstance: entity.isControlledSubstance,
  pharmaceutics: {
    id: entity.pharmaceutics.id,
    code: entity.pharmaceutics.code,
    commonBrandName: entity.pharmaceutics.commonBrandName,
    commonGenericName: entity.pharmaceutics.commonGenericName,
    clinicalName: entity.pharmaceutics.clinicalName,
    drugClass: entity.pharmaceutics.drugClass,
    chemicalConstituents: entity.pharmaceutics.chemicalConstituents,
    pharmaceutics: entity.pharmaceutics.pharmaceutics,
    indications: entity.pharmaceutics.indications,
    contraindications: entity.pharmaceutics.contraindications,
    mechanism: entity.pharmaceutics.mechanism,
    missedDose: entity.pharmaceutics.missedDose,
    drugInteractions: entity.pharmaceutics.drugInteractions,
    dosage: entity.pharmaceutics.dosage,
    createdAt: entity.pharmaceutics.createdAt.toISOString(),
    updatedAt: entity.pharmaceutics.updatedAt.toISOString(),
    deletedAt: entity.pharmaceutics.deletedAt ? entity.pharmaceutics.deletedAt.toISOString() : null,
  },
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});

@Injectable()
export class GenericProductsService {
  constructor(
    @InjectRepository(GenericProductEntity)
    private readonly genericProductRepository: Repository<GenericProductEntity>,
    @InjectRepository(PharmaceuticsEntity)
    private readonly pharmaceuticsRepository: Repository<PharmaceuticsEntity>,
  ) {}

  async list(query: ListGenericProductsDto): Promise<{ data: GenericProductType[]; total: number }> {
    const qb = this.genericProductRepository
      .createQueryBuilder('generic_product')
      .leftJoinAndSelect('generic_product.pharmaceutics', 'pharmacology_info')
      .where('generic_product.deleted_at IS NULL')
      .orderBy(`generic_product.${query.sortBy ?? 'name'}`, query.sortOrder === 'desc' ? 'DESC' : 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('(generic_product.code LIKE :search OR generic_product.name LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toGenericProductType), total };
  }

  async get(id: string): Promise<GenericProductType> {
    const item = await this.genericProductRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    if (!item) throw new NotFoundException('Generic product not found');
    return toGenericProductType(item);
  }

  async getByCode(code: string): Promise<GenericProductType> {
    const item = await this.genericProductRepository.findOne({
      where: { code, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    if (!item) throw new NotFoundException('Generic product not found');
    return toGenericProductType(item);
  }

  async create(payload: CreateGenericProductDto): Promise<GenericProductType> {
    const duplicate = await this.genericProductRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Generic product code already exists');

    const pharmaceutics = await this.pharmaceuticsRepository.findOne({
      where: { id: payload.pharmaceuticsId, deletedAt: IsNull() },
    });
    if (!pharmaceutics) throw new BadRequestException('Pharmaceutics info not found');

    const entity = this.genericProductRepository.create({
      code: payload.code,
      name: payload.name,
      therapeuticClass: payload.therapeuticClass ?? null,
      dosageForm: payload.dosageForm ?? null,
      strength: payload.strength ?? null,
      generalUse: payload.generalUse ?? '',
      adultDosage: payload.adultDosage ?? '',
      pediatricDosage: payload.pediatricDosage ?? '',
      isPrescriptionRequired: payload.isPrescriptionRequired ?? false,
      isControlledSubstance: payload.isControlledSubstance ?? false,
      pharmaceutics,
    });
    const savedEntity = await this.genericProductRepository.save(entity);
    const fullEntity = await this.genericProductRepository.findOneOrFail({
      where: { id: savedEntity.id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    return toGenericProductType(fullEntity);
  }

  async update(id: string, payload: UpdateGenericProductDto): Promise<GenericProductType> {
    const item = await this.genericProductRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    if (!item) throw new NotFoundException('Generic product not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.genericProductRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Generic product code already exists');
      item.code = payload.code;
    }

    if (payload.pharmaceuticsId) {
      const pharmaceutics = await this.pharmaceuticsRepository.findOne({
        where: { id: payload.pharmaceuticsId, deletedAt: IsNull() },
      });
      if (!pharmaceutics) throw new BadRequestException('Pharmaceutics info not found');
      item.pharmaceutics = pharmaceutics;
    }

    if (payload.name !== undefined) item.name = payload.name;
    if (payload.therapeuticClass !== undefined) item.therapeuticClass = payload.therapeuticClass ?? null;
    if (payload.dosageForm !== undefined) item.dosageForm = payload.dosageForm ?? null;
    if (payload.strength !== undefined) item.strength = payload.strength ?? null;
    if (payload.generalUse !== undefined) item.generalUse = payload.generalUse;
    if (payload.adultDosage !== undefined) item.adultDosage = payload.adultDosage;
    if (payload.pediatricDosage !== undefined) item.pediatricDosage = payload.pediatricDosage;
    if (payload.isPrescriptionRequired !== undefined) item.isPrescriptionRequired = payload.isPrescriptionRequired;
    if (payload.isControlledSubstance !== undefined) item.isControlledSubstance = payload.isControlledSubstance;

    const savedItem = await this.genericProductRepository.save(item);
    const fullEntity = await this.genericProductRepository.findOneOrFail({
      where: { id: savedItem.id, deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    return toGenericProductType(fullEntity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.genericProductRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Generic product not found');
  }

  async searchAll(): Promise<GenericProductType[]> {
    const items = await this.genericProductRepository.find({
      where: { deletedAt: IsNull() },
      relations: { pharmaceutics: true },
    });
    return items.map(toGenericProductType);
  }
}
