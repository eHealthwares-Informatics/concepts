import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { PharmaceuticsType } from '../types/drugs.types';
import { CreatePharmaceuticsDto, ListPharmaceuticsDto, UpdatePharmaceuticsDto } from '../dto/pharmaceutics.dto';
import { DrugComponentEntity, PharmaceuticsEntity } from '../entities';

const toPharmaceuticsType = (entity: PharmaceuticsEntity): PharmaceuticsType => ({
  id: entity.id,
  code: entity.code,
  commonBrandName: entity.commonBrandName,
  commonGenericName: entity.commonGenericName,
  clinicalName: entity.clinicalName,
  drugClass: entity.drugClass,
  chemicalConstituents: entity.chemicalConstituents,
  pharmaceutics: entity.pharmaceutics,
  indications: entity.indications,
  contraindications: entity.contraindications,
  mechanism: entity.mechanism,
  missedDose: entity.missedDose,
  drugInteractions: entity.drugInteractions,
  dosage: entity.dosage,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
});

@Injectable()
export class PharmaceuticsService {
  constructor(
    @InjectRepository(PharmaceuticsEntity)
    private readonly pharmaceuticsRepository: Repository<PharmaceuticsEntity>,
    @InjectRepository(DrugComponentEntity)
    private readonly drugComponentRepository: Repository<DrugComponentEntity>,
  ) {}

  async list(query: ListPharmaceuticsDto): Promise<{ data: PharmaceuticsType[]; total: number }> {
    const qb = this.pharmaceuticsRepository
      .createQueryBuilder('pharmaceutics')
      .leftJoinAndSelect('pharmaceutics.drugComponents', 'drugComponents')
      .where('pharmaceutics.deleted_at IS NULL')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere(
        '(pharmaceutics.code ILIKE :search OR pharmaceutics.clinical_name ILIKE :search OR pharmaceutics.common_generic_name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toPharmaceuticsType), total };
  }

  async get(id: string): Promise<PharmaceuticsType> {
    const item = await this.pharmaceuticsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { drugComponents: true },
    });
    if (!item) throw new NotFoundException('Pharmaceutics not found');
    return toPharmaceuticsType(item);
  }

  async getByCode(code: string): Promise<PharmaceuticsType> {
    const item = await this.pharmaceuticsRepository.findOne({
      where: { code, deletedAt: IsNull() },
      relations: { drugComponents: true },
    });
    if (!item) throw new NotFoundException('Pharmaceutics not found');
    return toPharmaceuticsType(item);
  }

  async create(payload: CreatePharmaceuticsDto): Promise<PharmaceuticsType> {
    const duplicate = await this.pharmaceuticsRepository.findOne({
      where: { code: payload.code, deletedAt: IsNull() },
    });
    if (duplicate) throw new BadRequestException('Pharmaceutics code already exists');

    const drugComponents = await this.resolveDrugComponents(payload.drugComponentIds);
    const entity = this.pharmaceuticsRepository.create({
      code: payload.code,
      commonBrandName: payload.commonBrandName ?? null,
      commonGenericName: payload.commonGenericName ?? null,
      clinicalName: payload.clinicalName ?? null,
      drugClass: payload.drugClass ?? null,
      chemicalConstituents: payload.chemicalConstituents ?? null,
      pharmaceutics: payload.pharmaceutics ?? null,
      indications: payload.indications ?? null,
      contraindications: payload.contraindications ?? null,
      mechanism: payload.mechanism ?? null,
      missedDose: payload.missedDose ?? null,
      drugInteractions: payload.drugInteractions ?? null,
      dosage: payload.dosage ?? null,
      drugComponents,
    });
    const saved = await this.pharmaceuticsRepository.save(entity);
    const full = await this.pharmaceuticsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { drugComponents: true },
    });
    return toPharmaceuticsType(full);
  }

  async update(id: string, payload: UpdatePharmaceuticsDto): Promise<PharmaceuticsType> {
    const item = await this.pharmaceuticsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { drugComponents: true },
    });
    if (!item) throw new NotFoundException('Pharmaceutics not found');

    if (payload.code && payload.code !== item.code) {
      const duplicate = await this.pharmaceuticsRepository.findOne({
        where: { code: payload.code, deletedAt: IsNull() },
      });
      if (duplicate) throw new BadRequestException('Pharmaceutics code already exists');
      item.code = payload.code;
    }

    if (payload.commonBrandName !== undefined) item.commonBrandName = payload.commonBrandName ?? null;
    if (payload.commonGenericName !== undefined) item.commonGenericName = payload.commonGenericName ?? null;
    if (payload.clinicalName !== undefined) item.clinicalName = payload.clinicalName ?? null;
    if (payload.drugClass !== undefined) item.drugClass = payload.drugClass ?? null;
    if (payload.chemicalConstituents !== undefined) item.chemicalConstituents = payload.chemicalConstituents ?? null;
    if (payload.pharmaceutics !== undefined) item.pharmaceutics = payload.pharmaceutics ?? null;
    if (payload.indications !== undefined) item.indications = payload.indications ?? null;
    if (payload.contraindications !== undefined) item.contraindications = payload.contraindications ?? null;
    if (payload.mechanism !== undefined) item.mechanism = payload.mechanism ?? null;
    if (payload.missedDose !== undefined) item.missedDose = payload.missedDose ?? null;
    if (payload.drugInteractions !== undefined) item.drugInteractions = payload.drugInteractions ?? null;
    if (payload.dosage !== undefined) item.dosage = payload.dosage ?? null;
    if (payload.drugComponentIds !== undefined) {
      item.drugComponents = await this.resolveDrugComponents(payload.drugComponentIds);
    }

    const saved = await this.pharmaceuticsRepository.save(item);
    const full = await this.pharmaceuticsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { drugComponents: true },
    });
    return toPharmaceuticsType(full);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pharmaceuticsRepository.softDelete({ id });
    if (!result.affected) throw new NotFoundException('Pharmaceutics not found');
  }

  private async resolveDrugComponents(ids: string[] | undefined): Promise<DrugComponentEntity[]> {
    if (!ids?.length) return [];
    const components = await this.drugComponentRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });
    if (components.length !== ids.length) throw new BadRequestException('One or more drug components were not found');
    return components;
  }
}
