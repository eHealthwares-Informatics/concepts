import { BadRequestException } from '@nestjs/common';
import { TreatmentPackService } from './treatment-pack.service';
import type { ClinicalMedicationService } from './clinical-medication.service';
import type { TreatmentPackEntity, TreatmentPackItemEntity } from '../entities';
import { TreatmentPackStatus } from '../types/clinical-triage.types';

const NOW = new Date('2026-01-01T00:00:00Z');

function item(overrides: Partial<TreatmentPackItemEntity> = {}): TreatmentPackItemEntity {
  return {
    id: 'item-1',
    packId: 'pack-1',
    itemType: 'GENERIC_MEDICINE',
    genericDrugId: 'drug-1',
    genericDrugCode: 'TRETINOIN_TOPICAL_0025',
    supportiveCareRef: null,
    protocolRegimenCode: 'NSTG-2022:acne:first-line',
    instructions: { dose: 'Apply a thin layer' },
    sequence: 0,
    required: true,
    pack: undefined as never,
    ...overrides,
  } as TreatmentPackItemEntity;
}

function pack(overrides: Partial<TreatmentPackEntity> = {}): TreatmentPackEntity {
  return {
    id: 'pack-1',
    code: 'ACNE_SELF_CARE_001',
    name: 'Acne — first-line self care',
    description: null,
    complaintCodes: ['ACNE'],
    eligibilityRules: {},
    exclusionRules: {},
    evidence: {},
    status: TreatmentPackStatus.APPROVED,
    version: 1,
    items: [item()],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } as TreatmentPackEntity;
}

function createService(packs: TreatmentPackEntity[], drugCatalogue: any[] = []) {
  // Minimal in-memory table: enough for create/update/read round-trips.
  const store: TreatmentPackEntity[] = [...packs];

  const packRepository: any = {
    find: jest.fn(async ({ where }: any) =>
      store.filter((entry) => entry.status === where.status),
    ),
    findOne: jest.fn(async ({ where }: any) => {
      if (where.id) return store.find((entry) => entry.id === where.id) ?? null;
      return store.find((entry) => entry.code === where.code) ?? null;
    }),
    create: jest.fn((payload: any) => ({ items: [], ...payload })),
    save: jest.fn(async (entity: any) => {
      const saved = {
        createdAt: NOW,
        updatedAt: NOW,
        ...entity,
        id: entity.id ?? `pack-${store.length + 1}`,
      };
      const index = store.findIndex((entry) => entry.id === saved.id);
      if (index >= 0) store[index] = saved;
      else store.push(saved);
      return saved;
    }),
  };

  const itemRepository: any = {
    delete: jest.fn(async () => ({ affected: 1 })),
    create: jest.fn((payload: any) => ({ ...payload })),
    save: jest.fn(async (rows: any) => rows),
  };

  const medications = {
    findForItems: jest.fn(async (ids: string[], codes: string[]) =>
      drugCatalogue.filter(
        (drug) => ids.includes(drug.id) || codes.includes(drug.code),
      ),
    ),
  } as unknown as ClinicalMedicationService;

  return {
    service: new TreatmentPackService(packRepository, itemRepository, medications),
    packRepository,
    itemRepository,
    medications,
  };
}

describe('TreatmentPackService', () => {
  describe('resolve', () => {
    it('returns approved packs that cover a requested complaint, ordered by code', async () => {
      const { service } = createService([
        pack({ id: 'pack-b', code: 'HEADACHE_SELF_CARE_001', complaintCodes: ['HEADACHE'] }),
        pack({ id: 'pack-a', code: 'ACNE_SELF_CARE_001' }),
      ]);

      const resolved = await service.resolve(['headache']);

      expect(resolved.map((entry) => entry.packCode)).toEqual(['HEADACHE_SELF_CARE_001']);
    });

    it('never offers packs that are not approved', async () => {
      const { service } = createService([
        pack({ status: TreatmentPackStatus.DRAFT }),
        pack({ id: 'pack-2', code: 'SECOND', status: TreatmentPackStatus.UNDER_REVIEW }),
      ]);

      expect(await service.resolve(['ACNE'])).toEqual([]);
    });

    it('drops packs excluded by the patient contraindication screen', async () => {
      const { service } = createService([
        pack({ exclusionRules: { contraindications: ['PREGNANCY'] } }),
      ]);

      expect((await service.resolve(['ACNE'], { contraindications: [] })).length).toBe(1);
      expect(
        (await service.resolve(['ACNE'], { contraindications: ['PREGNANCY'] })).length,
      ).toBe(0);
    });

    it('returns nothing when no complaint codes are supplied', async () => {
      const { service } = createService([pack()]);

      expect(await service.resolve([])).toEqual([]);
    });

    it('sorts items by sequence and extracts counselling and review flags', async () => {
      const { service } = createService([
        pack({
          eligibilityRules: { pharmacistReview: true },
          exclusionRules: { contraindications: ['PREGNANCY'], ageMin: 12 },
          items: [
            item({
              id: 'counselling',
              itemType: 'COUNSELLING',
              genericDrugId: null,
              genericDrugCode: null,
              instructions: { topic: 'Sun protection' },
              sequence: 1,
              required: false,
            }),
            item({ id: 'medicine', sequence: 0 }),
          ].reverse(),
        }),
      ]);

      const [resolved] = await service.resolve(['ACNE']);

      expect(resolved.items.map((entry) => entry.id)).toEqual(['medicine', 'counselling']);
      expect(resolved.counselling).toEqual([{ topic: 'Sun protection' }]);
      expect(resolved.warnings).toEqual({ contraindications: ['PREGNANCY'], ageMin: 12 });
      expect(resolved.requiresPharmacistReview).toBe(true);
      expect(resolved.version).toBe(1);
    });
  });

  describe('create', () => {
    it('rejects a duplicate pack code', async () => {
      const { service } = createService([pack()]);

      await expect(
        service.create({
          code: 'acne_self_care_001',
          name: 'Duplicate',
          complaintCodes: ['ACNE'],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('resolves generic references against generic_drugs', async () => {
      const drug = {
        id: 'drug-1',
        code: 'TRETINOIN_TOPICAL_0025',
        name: 'Tretinoin 0.025% topical',
      };
      const { service, itemRepository } = createService([], [drug]);

      await service.create({
        code: 'NEW_PACK',
        name: 'New pack',
        complaintCodes: ['acne'],
        items: [{ itemType: 'GENERIC_MEDICINE', genericDrugCode: drug.code }],
      });

      expect(itemRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({
          genericDrugId: 'drug-1',
          genericDrugCode: 'TRETINOIN_TOPICAL_0025',
          packId: 'pack-1',
        }),
      ]);
    });

    it('refuses a pack item that references an unknown generic medicine', async () => {
      const { service } = createService([], []);

      await expect(
        service.create({
          code: 'BAD_PACK',
          name: 'Bad pack',
          complaintCodes: ['ACNE'],
          items: [{ itemType: 'GENERIC_MEDICINE', genericDrugCode: 'NOT_A_DRUG' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('bumps the version on every edit', async () => {
      const { service, packRepository } = createService([pack({ version: 3 })]);

      const updated = await service.update('pack-1', { description: 'Updated' });

      expect(updated.version).toBe(4);
      expect(packRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'pack-1', description: 'Updated', version: 4 }),
      );
    });

    it('replaces items only when they are supplied', async () => {
      const { service, itemRepository } = createService([pack()]);

      await service.update('pack-1', { description: 'No item change' });
      expect(itemRepository.delete).not.toHaveBeenCalled();

      await service.update('pack-1', { items: [] });
      expect(itemRepository.delete).toHaveBeenCalledWith({ packId: 'pack-1' });
    });

    it('throws when the pack does not exist', async () => {
      const { service } = createService([]);

      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(
        'TreatmentPack missing not found',
      );
    });
  });
});
