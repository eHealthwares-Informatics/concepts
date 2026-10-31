import { ClinicalAssessmentService } from './clinical-assessment.service';
import { RecommendationService } from './recommendation.service';
import { TreatmentPackService } from './treatment-pack.service';
import type { ClinicalMedicationService } from './clinical-medication.service';
import type { RedFlagRuleService } from './red-flag-rule.service';
import type { RedFlagRuleEntity, TreatmentPackEntity } from '../entities';
import {
  RedFlagSeverity,
  RecommendationResponseStatus,
  TriageOutcome,
  TreatmentPackStatus,
  type RxShopClerkingState,
} from '../types/clinical-triage.types';

const NOW = new Date('2026-01-01T00:00:00Z');

const DRUGS = [
  { id: 'drug-tretinoin', code: 'TRETINOIN_TOPICAL_0025', name: 'Tretinoin 0.025% topical' },
  { id: 'drug-paracetamol', code: 'PARACETAMOL_500_TABLET', name: 'Paracetamol 500mg tablet' },
];

function state(overrides: Partial<RxShopClerkingState> = {}): RxShopClerkingState {
  return {
    sessionId: 'session-1',
    questionnaireCode: 'RXSHOP_CLERKING_V1',
    complaintCodes: ['ACNE'],
    symptoms: [{ code: 'PAPULES', status: 'PRESENT' }],
    contraindications: [{ code: 'PREGNANCY', value: false, status: 'ANSWERED' }],
    additionalInfo: { age: 24 },
    ...overrides,
  };
}

function rule(overrides: Partial<RedFlagRuleEntity> = {}): RedFlagRuleEntity {
  return {
    id: 'rule-1',
    code: 'ACNE_RF_SEVERE_PAIN',
    conditions: { complaintCodes: ['ACNE'], presentSymptoms: ['SEVERE_PAIN'] },
    severity: RedFlagSeverity.CRITICAL,
    triageOutcome: TriageOutcome.EMERGENCY_ASSESSMENT,
    requiredAction: 'REFER_IMMEDIATELY',
    message: 'Severe pain with acne — refer for urgent assessment.',
    protocolVersion: 'NSTG-2022-v1',
    evidence: {},
    isEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } as RedFlagRuleEntity;
}

function pack(overrides: Partial<TreatmentPackEntity> = {}): TreatmentPackEntity {
  return {
    id: 'pack-acne',
    code: 'ACNE_SELF_CARE_001',
    name: 'Acne — first-line self care',
    description: null,
    complaintCodes: ['ACNE'],
    eligibilityRules: {},
    exclusionRules: { contraindications: ['PREGNANCY'] },
    evidence: {},
    status: TreatmentPackStatus.APPROVED,
    version: 2,
    items: [
      {
        id: 'item-1',
        packId: 'pack-acne',
        itemType: 'GENERIC_MEDICINE',
        genericDrugId: null,
        genericDrugCode: 'TRETINOIN_TOPICAL_0025',
        supportiveCareRef: null,
        protocolRegimenCode: 'NSTG-2022:acne:first-line',
        instructions: { dose: 'Apply a thin layer', frequency: 'At night' },
        sequence: 0,
        required: true,
      },
      {
        id: 'item-2',
        packId: 'pack-acne',
        itemType: 'COUNSELLING',
        genericDrugId: null,
        genericDrugCode: null,
        supportiveCareRef: null,
        protocolRegimenCode: null,
        instructions: { topic: 'Sun protection' },
        sequence: 1,
        required: false,
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } as TreatmentPackEntity;
}

function createService(options: {
  rules?: RedFlagRuleEntity[];
  packs?: TreatmentPackEntity[];
  availability?: Record<string, any[]>;
} = {}) {
  const { rules = [], packs = [], availability = {} } = options;

  const ruleService = {
    activeRules: jest.fn().mockResolvedValue(rules),
  } as unknown as RedFlagRuleService;

  const packRepository: any = {
    find: jest.fn(async ({ where }: any) =>
      packs.filter((entry) => entry.status === where.status),
    ),
    findOne: jest.fn(async ({ where }: any) =>
      packs.find((entry) => entry.id === where.id || entry.code === where.code) ?? null,
    ),
    create: jest.fn((payload: any) => ({ ...payload })),
    save: jest.fn(async (entity: any) => entity),
  };
  const itemRepository: any = {
    delete: jest.fn(async () => ({ affected: 1 })),
    create: jest.fn((payload: any) => ({ ...payload })),
    save: jest.fn(async (rows: any) => rows),
  };

  const medications = {
    findForItems: jest.fn(async (ids: string[], codes: string[]) =>
      DRUGS.filter((drug) => ids.includes(drug.id) || codes.includes(drug.code)),
    ),
    availableProductsForDrugIds: jest.fn(async (ids: string[]) =>
      ids.flatMap((id) => availability[id] ?? []),
    ),
  } as unknown as ClinicalMedicationService;

  const assessment = new ClinicalAssessmentService(ruleService);
  const packService = new TreatmentPackService(packRepository, itemRepository, medications);
  const service = new RecommendationService(assessment, medications, packService);

  return { service, medications, ruleService };
}

describe('RecommendationService', () => {
  it('stops at escalation and surfaces the fired red flag as a notification', async () => {
    const { service, medications } = createService({ rules: [rule()] });

    const result = await service.recommend(
      state({ symptoms: [{ code: 'SEVERE_PAIN', status: 'PRESENT' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.REFERRAL_REQUIRED);
    expect(result.triageOutcome).toBe(TriageOutcome.EMERGENCY_ASSESSMENT);
    expect(result.reasonCodes).toEqual(['RED_FLAG_ACNE_RF_SEVERE_PAIN']);
    expect(result.notifications).toEqual([
      {
        type: 'RED_FLAG_CRITICAL',
        message: 'Severe pain with acne — refer for urgent assessment.',
      },
    ]);
    expect(result.recommendations).toBeUndefined();
    expect(medications.findForItems).not.toHaveBeenCalled();
  });

  it('returns the missing fields without looking for packs', async () => {
    const { service } = createService({ packs: [pack()] });

    const result = await service.recommend(state({ symptoms: [] }));

    expect(result.status).toBe(RecommendationResponseStatus.MORE_INFORMATION_REQUIRED);
    expect(result.missingFields).toEqual(['symptoms']);
    expect(result.recommendations).toBeUndefined();
  });

  it('stops at incomplete clerking before consulting the pack catalogue', async () => {
    const { service, medications } = createService({ packs: [pack()] });

    const result = await service.recommend(
      state({ complaintCodes: [], symptoms: [{ code: 'PAPULES', status: 'ABSENT' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.MORE_INFORMATION_REQUIRED);
    expect(result.missingFields).toEqual(['complaintCodes']);
    expect(result.recommendations).toBeUndefined();
    expect(medications.findForItems).not.toHaveBeenCalled();
  });

  it('reports no suitable option when no approved pack covers the complaint', async () => {
    const { service } = createService({ packs: [] });

    const result = await service.recommend(state());

    expect(result.status).toBe(RecommendationResponseStatus.NO_SUITABLE_OTC_OPTION);
    expect(result.triageOutcome).toBe(TriageOutcome.NO_SUITABLE_OTC_OPTION);
    expect(result.reasonCodes).toEqual(['NO_APPROVED_PACK_FOR_COMPLAINT']);
  });

  it('resolves the pack into a named prescription with availability', async () => {
    const { service, medications } = createService({
      packs: [pack()],
      availability: {
        'drug-tretinoin': [
          {
            genericMedicineCode: 'TRETINOIN_TOPICAL_0025',
            genericProductCode: 'GP-DEMO-TRETINOIN-0025',
            itemCode: 'DEMO-TRET-0025',
            requiredAttributes: { form: 'cream' },
            mappingStatus: 'matched_by_code',
          },
          {
            genericMedicineCode: 'TRETINOIN_TOPICAL_0025',
            genericProductCode: 'GP-SECOND-TRETINOIN',
            itemCode: 'SECOND',
            requiredAttributes: {},
            mappingStatus: 'matched_by_code',
          },
        ],
      },
    });

    const result = await service.recommend(state());

    expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);
    expect(result.triageOutcome).toBe(TriageOutcome.SELF_CARE_ELIGIBLE);
    expect(result.pharmacistReviewRequired).toBeUndefined();

    const [recommendation] = result.recommendations ?? [];
    expect(recommendation.packCode).toBe('ACNE_SELF_CARE_001');
    expect(recommendation.version).toBe(2);
    expect(recommendation.counselling).toEqual([{ topic: 'Sun protection' }]);
    expect(recommendation.warnings).toEqual({ contraindications: ['PREGNANCY'] });

    // The pack referenced the drug by code only; the id and human name are
    // resolved from the catalogue so callers can render a prescription.
    const [medicine, counselling] = recommendation.items;
    expect(medicine.genericDrugCode).toBe('TRETINOIN_TOPICAL_0025');
    expect(medicine.genericDrugId).toBe('drug-tretinoin');
    expect(medicine.genericDrugName).toBe('Tretinoin 0.025% topical');
    expect(counselling.genericDrugName).toBeNull();

    // One availability entry per generic medicine, first mapped product wins.
    expect(recommendation.itemsAvailability).toEqual([
      expect.objectContaining({
        genericMedicineCode: 'TRETINOIN_TOPICAL_0025',
        genericProductCode: 'GP-DEMO-TRETINOIN-0025',
      }),
    ]);
    expect(medications.findForItems).toHaveBeenCalledWith([], ['TRETINOIN_TOPICAL_0025']);

    // Prescriptions are array-valued: every pack item (medicine and counselling)
    // becomes a line, never a single flattened medicine.
    expect(result.prescriptions).toEqual([
      {
        packCode: 'ACNE_SELF_CARE_001',
        packName: 'Acne — first-line self care',
        itemType: 'GENERIC_MEDICINE',
        medicineCode: 'TRETINOIN_TOPICAL_0025',
        medicineName: 'Tretinoin 0.025% topical',
        dose: 'Apply a thin layer',
        frequency: 'At night',
        duration: null,
        instructions: { dose: 'Apply a thin layer', frequency: 'At night' },
        sequence: 0,
        required: true,
      },
      expect.objectContaining({
        packCode: 'ACNE_SELF_CARE_001',
        itemType: 'COUNSELLING',
        medicineCode: null,
        sequence: 1,
      }),
    ]);
  });

  it('returns no prescriptions when a red flag escalates', async () => {
    const { service } = createService({
      rules: [rule()],
      packs: [pack()],
    });

    const result = await service.recommend(
      state({ symptoms: [{ code: 'PAPULES', status: 'PRESENT' }, { code: 'SEVERE_PAIN', status: 'PRESENT' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.REFERRAL_REQUIRED);
    expect(result.prescriptions).toBeUndefined();
  });

  it('returns an empty availability list when nothing is mapped', async () => {
    const { service } = createService({ packs: [pack()] });

    const result = await service.recommend(state());

    expect(result.recommendations?.[0].itemsAvailability).toEqual([]);
  });

  it('flags pharmacist review when a matching pack asks for it', async () => {
    const { service } = createService({
      packs: [pack({ eligibilityRules: { pharmacistReview: true } })],
    });

    const result = await service.recommend(state());

    expect(result.pharmacistReviewRequired).toBe(true);
  });

  it('excludes a pack when the screening answer is the string "true"', async () => {
    const { service } = createService({ packs: [pack()] });

    const result = await service.recommend(
      state({ contraindications: [{ code: 'PREGNANCY', value: 'true', status: 'ANSWERED' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.NO_SUITABLE_OTC_OPTION);
    expect(result.reasonCodes).toEqual(['NO_APPROVED_PACK_FOR_COMPLAINT']);
  });

  it('keeps the pack when the screening answer is the string "false"', async () => {
    const { service } = createService({ packs: [pack()] });

    const result = await service.recommend(
      state({ contraindications: [{ code: 'PREGNANCY', value: 'false', status: 'ANSWERED' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);
  });
});
