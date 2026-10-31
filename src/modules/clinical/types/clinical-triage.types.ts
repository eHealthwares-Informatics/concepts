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

/** What a clerking question is asked for. */
export type ClerkingQuestionKind =
  | 'RED_FLAG'
  | 'SYMPTOM'
  | 'CONTRAINDICATION'
  | 'CONTEXT';

/**
 * One question the clerking agent may ask. Built from the knowledge base, never
 * from the conversation service's seed data — a new symptom, red flag or
 * contraindication becomes askable without a conversation deploy.
 */
export interface ClerkingQuestionSpec {
  /** Stable question code, e.g. SYMPTOM_PAPULES. */
  code: string;
  /** Stable id the conversation engine uses as the question's id. */
  questionId: string;
  /** Canonical attribute the answer is stored under, e.g. clerking.SYMPTOM_PAPULES. */
  clinicalAttribute: string;
  kind: ClerkingQuestionKind;
  /** Clinical code the answer resolves to (symptom/contraindication code). */
  targetCode: string | null;
  text: string;
  questionType: 'BOOLEAN' | 'NUMBER' | 'TEXT' | 'SINGLE_CHOICE';
  /** Choose-one answers; BOOLEAN questions expose PRESENT/ABSENT. */
  options: Array<{ key: string; label: string; value: string }>;
  required: boolean;
  /** Lower runs first; red flags are asked before anything else. */
  priority: number;
  /** How the answer maps into clerking state. */
  interpretation: {
    /** symptom finding the answer sets (status PRESENT/ABSENT). */
    symptomCode?: string;
    /** contraindication the answer resolves. */
    contraindicationCode?: string;
    /** additionalInfo field the answer fills (e.g. age). */
    infoField?: string;
    /** Severity that fires when the answer is affirmative. */
    redFlag?: { ruleCode: string; severity: string };
  };
}

/** Ordered question plan for one or more complaints. */
export interface ClerkingPlan {
  complaintCodes: string[];
  protocolVersion: string;
  questions: ClerkingQuestionSpec[];
}

/** Answer already given, as read from the workflow state. */
export interface ClerkingAnswerInput {
  questionId?: string;
  questionCode?: string;
  clinicalAttribute?: string;
  /** Every answer recorded for that question, newest last. */
  values: unknown[];
}

/** Next-question request the conversation engine posts after every answer. */
export interface ClerkingNextQuestionRequest {
  state: RxShopClerkingState;
  /** Explicitly skipped question codes (patient refused / not applicable). */
  skipQuestionCodes?: string[];
}

export interface ClerkingNextQuestionResult {
  status: 'QUESTION' | 'COMPLETE';
  done: boolean;
  question: ClerkingQuestionSpec | null;
  /** Questions still unanswered after this one. */
  remainingQuestionCodes: string[];
  /**
   * The same pending questions with their text, so a caller (e.g. an AI
   * clerking agent) can choose a shorter path without a second round trip.
   */
  remainingQuestions: ClerkingQuestionSpec[];
  complaintCodes: string[];
  protocolVersion: string;
}

/** One medicine line in a prescription (array-valued, never a single item). */
export interface PrescriptionLine {
  packCode: string;
  packName: string;
  itemType: string;
  medicineCode: string | null;
  medicineName: string | null;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: Record<string, any>;
  sequence: number;
  required: boolean;
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
  /**
   * Every answer given, one entry per question, `values` kept as an array so
   * repeated/clarifying answers to the same question accumulate instead of
   * overwriting each other.
   */
  answers?: ClerkingAnswerInput[];
  /** Question codes already asked (so re-asking never happens). */
  askedQuestionCodes?: string[];
  /** Prescriptions resolved for this session — always an array. */
  prescriptions?: PrescriptionLine[];
  triageOutcome?: TriageOutcome;
  recommendationRequestId?: string;
  recommendationResult?: Record<string, unknown>;
  treatmentPackIds?: string[];
  availableItemsResult?: Record<string, unknown>;
  pharmacistReviewStatus?: string;
}
