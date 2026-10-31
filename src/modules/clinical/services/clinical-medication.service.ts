import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateGenericMedicineDto,
  CreateMedicineMappingDto,
  ListGenericMedicinesDto,
  UpdateGenericMedicineDto,
} from '../dto/treatment-packs.dto';
import { GenericDrugEntity, GenericProductEntity } from '../../drugs/entities';
import type {
  AvailableItemType,
  ClinicalGenericMedicineType,
} from '../types/clinical.types';

export const toClinicalGenericMedicineType = (
  entity: GenericDrugEntity,
): ClinicalGenericMedicineType => ({
  id: entity.id,
  code: entity.code,
  name: entity.name,
  isOtc: entity.isOtc,
  ingredients: entity.ingredients,
  strengths: entity.strengths,
  routes: entity.routes,
  dosageForms: entity.dosageForms,
  restrictions: entity.restrictions,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Clinical view of the medicine catalogue.
 *
 * Approved generic regimens are the drugs module's `generic_drugs` rows (GN
 * codes); sellable brands are `generic_products` rows (GP codes). Clinical and
 * commercial stay separate: packs reference generics, and availability is
 * resolved through the product mapping columns added for clerking
 * (`clinical_mapping_status`, `commercial_item_code`, `required_attributes`).
 */
@Injectable()
export class ClinicalMedicationService {
  constructor(
    @InjectRepository(GenericDrugEntity)
    private readonly drugs: Repository<GenericDrugEntity>,
    @InjectRepository(GenericProductEntity)
    private readonly products: Repository<GenericProductEntity>,
  ) {}

  async list(
    query: ListGenericMedicinesDto,
  ): Promise<{ data: ClinicalGenericMedicineType[]; total: number }> {
    const qb = this.drugs
      .createQueryBuilder('drug')
      .orderBy('drug.name', 'ASC')
      .skip(query.offset)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('(LOWER(drug.code) LIKE LOWER(:search) OR LOWER(drug.name) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }
    if (query.isOtc !== undefined) {
      qb.andWhere('drug.is_otc = :isOtc', { isOtc: Boolean(query.isOtc) });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(toClinicalGenericMedicineType), total };
  }

  async getByCode(code: string): Promise<ClinicalGenericMedicineType> {
    const entity = await this.drugs.findOne({ where: { code: code.toUpperCase() } });
    if (!entity) throw new NotFoundException(`Generic medicine ${code} not found`);
    return toClinicalGenericMedicineType(entity);
  }

  async create(payload: CreateGenericMedicineDto): Promise<ClinicalGenericMedicineType> {
    const code = payload.code.trim().toUpperCase();
    const duplicate = await this.drugs.findOne({ where: { code } });
    if (duplicate) throw new BadRequestException(`Generic medicine ${code} already exists`);

    const entity = this.drugs.create({
      code,
      name: payload.name.trim(),
      isOtc: payload.isOtc ?? false,
      ingredients: payload.ingredients ?? null,
      strengths: payload.strengths ?? null,
      routes: payload.routes ?? null,
      dosageForms: payload.dosageForms ?? null,
      restrictions: payload.restrictions ?? null,
    });
    return toClinicalGenericMedicineType(await this.drugs.save(entity));
  }

  async update(
    id: string,
    payload: UpdateGenericMedicineDto,
  ): Promise<ClinicalGenericMedicineType> {
    const entity = await this.drugs.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Generic medicine ${id} not found`);

    if (payload.code !== undefined) entity.code = payload.code.trim().toUpperCase();
    if (payload.name !== undefined) entity.name = payload.name.trim();
    if (payload.isOtc !== undefined) entity.isOtc = payload.isOtc;
    if (payload.ingredients !== undefined) entity.ingredients = payload.ingredients;
    if (payload.strengths !== undefined) entity.strengths = payload.strengths;
    if (payload.routes !== undefined) entity.routes = payload.routes;
    if (payload.dosageForms !== undefined) entity.dosageForms = payload.dosageForms;
    if (payload.restrictions !== undefined) entity.restrictions = payload.restrictions;

    return toClinicalGenericMedicineType(await this.drugs.save(entity));
  }

  /** Generic drugs referenced by a pack, keyed by id and code. */
  async findForItems(ids: string[], codes: string[]): Promise<GenericDrugEntity[]> {
    const where: Array<Record<string, any>> = [];
    if (ids.length) where.push({ id: In(ids) });
    if (codes.length) where.push({ code: In(codes.map((code) => code.toUpperCase())) });
    if (!where.length) return [];
    return this.drugs.find({ where });
  }

  /**
   * Mapped products for a set of generic drugs (available-items input). Only
   * products with a reconciled mapping are offered.
   */
  async availableProductsForDrugIds(genericDrugIds: string[]): Promise<AvailableItemType[]> {
    if (!genericDrugIds.length) return [];

    const rows = await this.products
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.genericDrug', 'drug')
      .where('drug.id IN (:...ids)', { ids: genericDrugIds })
      .andWhere('product.clinical_mapping_status <> :unmapped', { unmapped: 'unmapped' })
      .orderBy('drug.code', 'ASC')
      .addOrderBy('product.code', 'ASC')
      .getMany();

    return rows.map((product) => ({
      genericMedicineCode: product.genericDrug?.code ?? '',
      genericProductCode: product.code,
      itemCode: product.commercialItemCode,
      requiredAttributes: product.requiredAttributes ?? {},
      mappingStatus: product.clinicalMappingStatus,
    }));
  }

  /** Reconcile a generic medicine → catalogue product mapping. */
  async applyMapping(payload: CreateMedicineMappingDto): Promise<AvailableItemType> {
    const drug = await this.drugs.findOne({
      where: { code: payload.genericDrugCode.trim().toUpperCase() },
    });
    if (!drug) {
      throw new NotFoundException(`Generic medicine ${payload.genericDrugCode} not found`);
    }

    const product = await this.products.findOne({
      where: { code: payload.genericProductCode.trim() },
      relations: { genericDrug: true },
    });
    if (!product) {
      throw new NotFoundException(`Generic product ${payload.genericProductCode} not found`);
    }

    product.genericDrug = drug;
    product.clinicalMappingStatus = payload.mappingStatus ?? 'matched_by_code';
    if (payload.itemCode !== undefined) product.commercialItemCode = payload.itemCode;
    if (payload.requiredAttributes !== undefined) {
      product.requiredAttributes = payload.requiredAttributes;
    }
    const saved = await this.products.save(product);

    return {
      genericMedicineCode: drug.code,
      genericProductCode: saved.code,
      itemCode: saved.commercialItemCode,
      requiredAttributes: saved.requiredAttributes ?? {},
      mappingStatus: saved.clinicalMappingStatus,
    };
  }
}
