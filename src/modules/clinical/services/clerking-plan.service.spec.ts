import { ClerkingPlanService } from './clerking-plan.service';
import type {
  ComplaintSymptomEntity,
  ContraindicationEntity,
  RedFlagRuleEntity,
  SymptomEntity,
} from '../entities';
import {
  RedFlagSeverity,
  TriageOutcome,
  type RxShopClerkingState,
} from '../types/clinical-triage.types';

type Repo<T> = {
  find: jest.Mock;
  createQueryBuilder: jest.Mock;
};

function repo<T>(rows: T[]): Repo<T> {
  return {
    find: jest.fn().mockResolvedValue(rows),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    }),
  };
}

function symptom(overrides: Partial<SymptomEntity> = {}): SymptomEntity {
  return {
    id: 'symptom-1',
    code: 'PAPULES',
    name: 'red bumps / pimples',
    synonyms: [],
    category: 'Skin',
    interpretation: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as SymptomEntity;
}

function association(
  overrides: Partial<ComplaintSymptomEntity> = {},
): ComplaintSymptomEntity {
  return {
    id: 'assoc-1',
    complaintCode: 'ACNE',
    symptomCode: 'PAPULES',
    applicability: 'PRIMARY',
    questionRef: null,
    conditionalRules: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as ComplaintSymptomEntity;
}

function rule(overrides: Partial<RedFlagRuleEntity> = {}): RedFlagRuleEntity {
  return {
    id: 'rule-1',
    code: 'ACNE_RF_SEVERE_PAIN',
    conditions: { complaintCodes: ['ACNE'], presentSymptoms: ['SEVERE_PAIN'] },
    severity: RedFlagSeverity.CRITICAL,
    triageOutcome: TriageOutcome.EMERGENCY_ASSESSMENT,
    requiredAction: 'REFER_IMMEDIATELY',
    message: 'Refer immediately.',
    protocolVersion: 'NSTG-2022-v1',
    evidence: {},
    isEnabled: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as RedFlagRuleEntity;
}

function contraindication(
  overrides: Partial<ContraindicationEntity> = {},
): ContraindicationEntity {
  return {
    id: 'ci-1',
    code: 'PREGNANCY',
    applicability: { complaints: ['ACNE'] },
    significance: 'ABSOLUTE',
    medicineExclusions: [],
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as ContraindicationEntity;
}

function createService(rows: {
  symptoms?: SymptomEntity[];
  associations?: ComplaintSymptomEntity[];
  rules?: RedFlagRuleEntity[];
  contraindications?: ContraindicationEntity[];
} = {}) {
  return new ClerkingPlanService(
    repo(rows.symptoms ?? [symptom()]) as any,
    repo(rows.associations ?? [association()]) as any,
    repo(rows.rules ?? [rule()]) as any,
    repo(rows.contraindications ?? [contraindication()]) as any,
  );
}

const CLERKING: RxShopClerkingState = {
  sessionId: 'session-1',
  questionnaireCode: 'RXSHOP_CLERKING_V1',
  complaintCodes: ['ACNE'],
  symptoms: [],
  contraindications: [],
  additionalInfo: {},
};

describe('ClerkingPlanService', () => {
  it('builds every question from the knowledge base, red flags first', async () => {
    const service = createService();

    const plan = await service.plan(['ACNE']);

    expect(plan.complaintCodes).toEqual(['ACNE']);
    expect(plan.questions.map((question) => question.code)).toEqual([
      'SYMPTOM_SEVERE_PAIN',
      'SYMPTOM_PAPULES',
      'CONTRAINDICATION_PREGNANCY',
      'CONTEXT_AGE',
    ]);
    expect(plan.questions[0]).toMatchObject({
      kind: 'RED_FLAG',
      questionType: 'BOOLEAN',
      interpretation: { symptomCode: 'SEVERE_PAIN' },
    });
  });

  it('never asks a question whose answer the state already holds', async () => {
    const service = createService();

    const result = await service.nextQuestion({
      ...CLERKING,
      symptoms: [
        { code: 'SEVERE_PAIN', status: 'ABSENT' },
        { code: 'PAPULES', status: 'PRESENT' },
      ],
    } as RxShopClerkingState);

    expect(result.done).toBe(false);
    expect(result.question?.code).toBe('CONTRAINDICATION_PREGNANCY');
  });

  it('treats attributes already present in the workflow state map as answered', async () => {
    const service = createService();

    const result = await service.nextQuestion({
      ...CLERKING,
      symptoms: [],
      contraindications: [],
      // What the conversation engine's attribute map looks like mid-flow.
      'clerking.symptom.SEVERE_PAIN': 'ABSENT',
      'clerking.symptom.PAPULES': 'PRESENT',
      'clerking.contraindication.PREGNANCY': 'false',
      'clerking.context.age': 24,
    } as unknown as RxShopClerkingState);

    expect(result).toMatchObject({ status: 'COMPLETE', done: true, question: null });
  });

  it('returns everything still pending when one answer is missing', async () => {
    const service = createService();

    const result = await service.nextQuestion({
      ...CLERKING,
      symptoms: [{ code: 'SEVERE_PAIN', status: 'ABSENT' }],
    } as RxShopClerkingState);

    expect(result.question?.code).toBe('SYMPTOM_PAPULES');
    expect(result.remainingQuestionCodes).toEqual([
      'CONTRAINDICATION_PREGNANCY',
      'CONTEXT_AGE',
    ]);
  });

  it('honours explicitly skipped questions', async () => {
    const service = createService();

    const result = await service.nextQuestion(
      { ...CLERKING, symptoms: [{ code: 'PAPULES', status: 'PRESENT' }] } as RxShopClerkingState,
      ['SYMPTOM_SEVERE_PAIN', 'CONTRAINDICATION_PREGNANCY', 'CONTEXT_AGE'],
    );

    expect(result.done).toBe(true);
  });

  it('asks nothing when no complaint is selected', async () => {
    const service = createService();

    const plan = await service.plan([]);

    expect(plan.questions).toEqual([]);
  });

  it('scopes contraindications to the selected complaint', async () => {
    const service = createService({
      contraindications: [
        contraindication(),
        contraindication({
          id: 'ci-2',
          code: 'LIVER_DISEASE',
          applicability: { complaints: ['HEADACHE'] },
        }),
      ],
    });

    const plan = await service.plan(['ACNE']);

    expect(plan.questions.some((question) => question.code === 'CONTRAINDICATION_PREGNANCY')).toBe(
      true,
    );
    expect(plan.questions.some((question) => question.code === 'CONTRAINDICATION_LIVER_DISEASE')).toBe(
      false,
    );
  });
});
