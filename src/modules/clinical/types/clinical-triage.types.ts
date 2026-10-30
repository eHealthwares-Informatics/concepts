/**
 * Clinical triage vocabulary — the deterministic contract shared by the
 * knowledge base, the red-flag rules engine and the recommendation resolver.
 *
 * These enums moved here from the conversation engine: clinical reference data
 * and the rules that consume it belong to the concepts service. The clerking
 * state itself stays in `WorkflowInstance.state` in the conversation service —
 * there is no dual persistence of clinical answers.
 */

/** Supported assessment outcomes (§7). */
export enum TriageOutcome {
  SELF_CARE_ELIGIBLE = 'SELF_CARE_ELIGIBLE',
  MORE_INFORMATION_REQUIRED = 'MORE_INFORMATION_REQUIRED',
  PHARMACIST_REVIEW_REQUIRED = 'PHARMACIST_REVIEW_REQUIRED',
  ROUTINE_CLINICAL_REVIEW = 'ROUTINE_CLINICAL_REVIEW',
  URGENT_ASSESSMENT = 'URGENT_ASSESSMENT',
  EMERGENCY_ASSESSMENT = 'EMERGENCY_ASSESSMENT',
  NO_SUITABLE_OTC_OPTION = 'NO_SUITABLE_OTC_OPTION',
}

/** Lifecycle of a clinical reference entity (complaints, symptoms, rules). */
export enum ClinicalStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
}

/** Treatment pack approval lifecycle (§9.1). */
export enum TreatmentPackStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  RETIRED = 'RETIRED',
}

/** Recommendation response statuses (deterministic branches, §8). */
export enum RecommendationResponseStatus {
  RECOMMENDATIONS_AVAILABLE = 'RECOMMENDATIONS_AVAILABLE',
  MORE_INFORMATION_REQUIRED = 'MORE_INFORMATION_REQUIRED',
  PHARMACIST_REVIEW_REQUIRED = 'PHARMACIST_REVIEW_REQUIRED',
  REFERRAL_REQUIRED = 'REFERRAL_REQUIRED',
  NO_SUITABLE_OTC_OPTION = 'NO_SUITABLE_OTC_OPTION',
  ASSESSMENT_INCOMPLETE = 'ASSESSMENT_INCOMPLETE',
}

/** Symptom finding state in clerking state. */
export type SymptomFindingStatus = 'PRESENT' | 'ABSENT' | 'UNKNOWN';

/**
 * Answer coercion for contraindication screening.
 *
 * Clerking answers arrive from a questionnaire workflow, so a "yes" can be
 * `true`, `"true"`, `"yes"` or `1` depending on the question's option values.
 * Treat all of them as affirmative so pack exclusion never silently misses a
 * positive screen.
 */
export function isAffirmativeAnswer(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    return ['true', 'yes', 'y', '1'].includes(value.trim().toLowerCase());
  }
  return false;
}

/** Contraindication screening state in clerking state. */
export type ContraindicationAnswerStatus = 'ANSWERED' | 'UNKNOWN' | 'NOT_ASKED';

/** Rule severity, most severe first. */
export enum RedFlagSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}

/**
 * Canonical clerking state (§4.3) as supplied by the conversation engine. It is
 * read from `WorkflowInstance.state`; this service never persists it.
 */
export interface RxShopClerkingState {
  sessionId: string;
  questionnaireCode: 'RXSHOP_CLERKING_V1';
  complaintCodes: string[];
  symptoms: Array<{
    code: string;
    status: SymptomFindingStatus;
    details?: Record<string, unknown>;
  }>;
  contraindications: Array<{
    code: string;
    value: unknown;
    status: ContraindicationAnswerStatus;
  }>;
  additionalInfo: Record<string, unknown>;
  triageOutcome?: TriageOutcome;
  recommendationRequestId?: string;
  recommendationResult?: Record<string, unknown>;
  treatmentPackIds?: string[];
  availableItemsResult?: Record<string, unknown>;
  pharmacistReviewStatus?: string;
}
