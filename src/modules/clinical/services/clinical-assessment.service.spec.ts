import {
  ClinicalAssessmentService,
  DEFAULT_PROTOCOL_VERSION,
} from './clinical-assessment.service';
import type { RedFlagRuleEntity } from '../entities';
import type { RedFlagRuleService } from './red-flag-rule.service';
import {
  RedFlagSeverity,
  RecommendationResponseStatus,
  TriageOutcome,
  type RxShopClerkingState,
} from '../types/clinical-triage.types';

const CLERKING: RxShopClerkingState = {
  sessionId: 'session-1',
  questionnaireCode: 'RXSHOP_CLERKING_V1',
  complaintCodes: ['ACNE'],
  symptoms: [{ code: 'PAPULES', status: 'PRESENT' }],
  contraindications: [{ code: 'PREGNANCY', value: false, status: 'ANSWERED' }],
  additionalInfo: { age: 24 },
};

function state(overrides: Partial<RxShopClerkingState> = {}): RxShopClerkingState {
  return { ...CLERKING, ...overrides };
}

function rule(overrides: Partial<RedFlagRuleEntity> = {}): RedFlagRuleEntity {
  return {
    id: 'rule-1',
    code: 'TEST_RULE',
    conditions: {},
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

function createService(rules: RedFlagRuleEntity[]) {
  const ruleService = {
    activeRules: jest.fn().mockResolvedValue(rules),
  } as unknown as RedFlagRuleService;

  return { service: new ClinicalAssessmentService(ruleService), ruleService };
}

describe('ClinicalAssessmentService', () => {
  it('returns self-care eligibility when no rule fires and the state is complete', async () => {
    const { service, ruleService } = createService([]);

    const result = await service.assess(state());

    expect(ruleService.activeRules).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);
    expect(result.triageOutcome).toBe(TriageOutcome.SELF_CARE_ELIGIBLE);
    expect(result.reasonCodes).toEqual(['NO_RED_FLAGS']);
    expect(result.firedRules).toEqual([]);
    expect(result.missingFields).toEqual([]);
    expect(result.protocolVersion).toBe(DEFAULT_PROTOCOL_VERSION);
  });

  it('reports every missing field before recommending anything', async () => {
    const { service } = createService([]);

    const result = await service.assess(
      state({
        complaintCodes: [],
        symptoms: [],
        contraindications: [
          { code: 'PREGNANCY', value: null, status: 'NOT_ASKED' },
          { code: 'LIVER_DISEASE', value: false, status: 'ANSWERED' },
        ],
      }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.MORE_INFORMATION_REQUIRED);
    expect(result.triageOutcome).toBe(TriageOutcome.MORE_INFORMATION_REQUIRED);
    expect(result.missingFields).toEqual([
      'complaintCodes',
      'symptoms',
      'contraindicationScreening',
    ]);
    expect(result.reasonCodes).toEqual([
      'MISSING_complaintCodes',
      'MISSING_symptoms',
      'MISSING_contraindicationScreening',
    ]);
  });

  it('asks for the complaint before judging symptoms, even when all are absent', async () => {
    const { service } = createService([]);

    const result = await service.assess(
      state({ complaintCodes: [], symptoms: [{ code: 'PAPULES', status: 'ABSENT' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.MORE_INFORMATION_REQUIRED);
    expect(result.missingFields).toEqual(['complaintCodes']);
    expect(result.reasonCodes).toEqual(['MISSING_complaintCodes']);
  });

  it('still recommends when a complaint is known but no symptom is present', async () => {
    const { service } = createService([]);

    const result = await service.assess(
      state({ symptoms: [{ code: 'PAPULES', status: 'ABSENT' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);
  });

  it('escalates with the fired rule details for emergency outcomes', async () => {
    const { service } = createService([
      rule({
        code: 'ACNE_RF_SEVERE_PAIN',
        conditions: { complaintCodes: ['ACNE'], presentSymptoms: ['SEVERE_PAIN'] },
        message: 'Severe pain with acne — refer.',
        protocolVersion: 'NSTG-2022-v1',
      }),
    ]);

    const result = await service.assess(
      state({ symptoms: [{ code: 'SEVERE_PAIN', status: 'PRESENT' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.REFERRAL_REQUIRED);
    expect(result.triageOutcome).toBe(TriageOutcome.EMERGENCY_ASSESSMENT);
    expect(result.reasonCodes).toEqual(['RED_FLAG_ACNE_RF_SEVERE_PAIN']);
    expect(result.firedRules).toEqual([
      {
        code: 'ACNE_RF_SEVERE_PAIN',
        severity: RedFlagSeverity.CRITICAL,
        message: 'Severe pain with acne — refer.',
      },
    ]);
    expect(result.protocolVersion).toBe('NSTG-2022-v1');
  });

  it('routes pharmacist-review outcomes without referring the patient', async () => {
    const { service } = createService([
      rule({
        code: 'ACNE_RF_PREGNANCY',
        triageOutcome: TriageOutcome.PHARMACIST_REVIEW_REQUIRED,
        conditions: { contraindications: [{ code: 'PREGNANCY' }] },
      }),
    ]);

    const result = await service.assess(
      state({ contraindications: [{ code: 'PREGNANCY', value: true, status: 'ANSWERED' }] }),
    );

    expect(result.status).toBe(RecommendationResponseStatus.PHARMACIST_REVIEW_REQUIRED);
    expect(result.triageOutcome).toBe(TriageOutcome.PHARMACIST_REVIEW_REQUIRED);
  });

  it('uses the first matching rule so severity ordering decides the escalation', async () => {
    const { service } = createService([
      rule({
        code: 'MAJOR_FIRST',
        severity: RedFlagSeverity.MAJOR,
        triageOutcome: TriageOutcome.ROUTINE_CLINICAL_REVIEW,
        conditions: { presentSymptoms: ['PAPULES'] },
      }),
      rule({
        code: 'CRITICAL_SECOND',
        severity: RedFlagSeverity.CRITICAL,
        conditions: { presentSymptoms: ['PAPULES'] },
      }),
    ]);

    const result = await service.assess(state());

    expect(result.reasonCodes).toEqual(['RED_FLAG_MAJOR_FIRST']);
    expect(result.triageOutcome).toBe(TriageOutcome.ROUTINE_CLINICAL_REVIEW);
  });

  describe('rule predicates', () => {
    it('requires a complaint-code intersection when complaintCodes is set', async () => {
      const { service } = createService([
        rule({ code: 'HEADACHE_ONLY', conditions: { complaintCodes: ['HEADACHE'] } }),
      ]);

      const result = await service.assess(state({ complaintCodes: ['ACNE'] }));

      expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);
    });

    it('treats presentSymptoms as any-of', async () => {
      const { service } = createService([
        rule({
          code: 'ANY_OF',
          conditions: { presentSymptoms: ['SEVERE_PAIN', 'NECK_STIFFNESS'] },
        }),
      ]);

      const result = await service.assess(
        state({ symptoms: [{ code: 'NECK_STIFFNESS', status: 'PRESENT' }] }),
      );

      expect(result.reasonCodes).toEqual(['RED_FLAG_ANY_OF']);
    });

    it('treats absentSymptoms as all-of', async () => {
      const { service } = createService([
        rule({
          code: 'ALL_ABSENT',
          conditions: { absentSymptoms: ['FEVER', 'NECK_STIFFNESS'] },
        }),
      ]);

      const partlyAbsent = await service.assess(
        state({
          symptoms: [
            { code: 'FEVER', status: 'ABSENT' },
            { code: 'NECK_STIFFNESS', status: 'PRESENT' },
          ],
        }),
      );
      expect(partlyAbsent.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);

      const allAbsent = await service.assess(
        state({
          symptoms: [
            { code: 'FEVER', status: 'ABSENT' },
            { code: 'NECK_STIFFNESS', status: 'ABSENT' },
          ],
        }),
      );
      expect(allAbsent.reasonCodes).toEqual(['RED_FLAG_ALL_ABSENT']);
    });

    it('does not fire a rule whose symptom was never recorded', async () => {
      const { service } = createService([
        rule({ code: 'UNKNOWN_SYMPTOM', conditions: { presentSymptoms: ['RASH'] } }),
      ]);

      const result = await service.assess(state());

      expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);
    });

    it('matches contraindication screens set to true or to a configured value', async () => {
      const { service } = createService([
        rule({
          code: 'PREGNANCY_TRUE',
          conditions: { contraindications: [{ code: 'PREGNANCY' }] },
        }),
        rule({
          code: 'LIVER_YES',
          conditions: { contraindications: [{ code: 'LIVER_DISEASE', matchValue: 'yes' }] },
        }),
      ]);

      const byValue = await service.assess(
        state({
          contraindications: [
            { code: 'PREGNANCY', value: true, status: 'ANSWERED' },
            { code: 'LIVER_DISEASE', value: 'yes', status: 'ANSWERED' },
          ],
        }),
      );
      expect(byValue.reasonCodes).toEqual(['RED_FLAG_PREGNANCY_TRUE']);

      const byMatchValue = await service.assess(
        state({
          contraindications: [
            { code: 'PREGNANCY', value: false, status: 'ANSWERED' },
            { code: 'LIVER_DISEASE', value: 'yes', status: 'ANSWERED' },
          ],
        }),
      );
      expect(byMatchValue.reasonCodes).toEqual(['RED_FLAG_LIVER_YES']);
    });

    it('treats questionnaire "true"/"yes" answers as affirmative screening', async () => {
      const { service } = createService([
        rule({
          code: 'LIVER_TRUE_STRING',
          conditions: { contraindications: [{ code: 'LIVER_DISEASE' }] },
        }),
      ]);

      const result = await service.assess(
        state({
          contraindications: [{ code: 'LIVER_DISEASE', value: 'YES', status: 'ANSWERED' }],
        }),
      );

      expect(result.reasonCodes).toEqual(['RED_FLAG_LIVER_TRUE_STRING']);
    });

    it('skips a rule that needs patient context the state does not carry', async () => {
      const { service } = createService([
        rule({ code: 'NEEDS_WEIGHT', conditions: { requiredFields: ['weightKg'] } }),
      ]);

      const result = await service.assess(state({ additionalInfo: {} }));

      expect(result.status).toBe(RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE);

      const withContext = await service.assess(state({ additionalInfo: { weightKg: 70 } }));
      expect(withContext.reasonCodes).toEqual(['RED_FLAG_NEEDS_WEIGHT']);
    });
  });
});
