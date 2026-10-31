import { Injectable, Logger } from '@nestjs/common';
import { RedFlagRuleEntity } from '../entities';
import type { ClinicalAssessmentResult } from '../types/clinical.types';
import {
  isAffirmativeAnswer,
  RecommendationResponseStatus,
  RxShopClerkingState,
  SymptomFindingStatus,
  TriageOutcome,
} from '../types/clinical-triage.types';
import { RedFlagRuleService } from './red-flag-rule.service';

/** Fallback protocol version when no rule fires and no rule is matched. */
export const DEFAULT_PROTOCOL_VERSION = 'NSTG-2022-v1';

/**
 * Clinical assessment — deterministic rules engine (§7).
 *
 * Evaluates enabled red-flag rules against the canonical clerking state after
 * every clinically relevant answer. Invariants:
 *  - Server-authoritative: callers may only pass `WorkflowInstance.state`;
 *    nothing here persists clinical answers.
 *  - No LLM: red flags are exact/predicate rules only.
 *  - Escalation ordering: CRITICAL > MAJOR > MINOR; the first matching rule of
 *    the highest severity wins (rules arrive pre-sorted by severity).
 *  - Unknown findings never invent danger: a rule referencing an unknown
 *    symptom does not fire, but missing required information still blocks.
 */
@Injectable()
export class ClinicalAssessmentService {
  private readonly logger = new Logger(ClinicalAssessmentService.name);

  constructor(private readonly rules: RedFlagRuleService) {}

  async assess(state: RxShopClerkingState): Promise<ClinicalAssessmentResult> {
    const rules = await this.rules.activeRules();

    let fired: RedFlagRuleEntity | undefined;
    for (const rule of rules) {
      if (this.evaluateRule(rule, state)) {
        fired = rule;
        // Rules are severity-ordered; the first match is the escalation.
        break;
      }
    }

    if (fired) {
      this.logger.warn(
        `Red flag ${fired.code} fired for session ${state.sessionId} -> ${fired.triageOutcome}`,
      );
      // ESCALATION: interrupt routine flow; stop pharmacological fulfilment.
      const referral =
        fired.triageOutcome === TriageOutcome.EMERGENCY_ASSESSMENT ||
        fired.triageOutcome === TriageOutcome.URGENT_ASSESSMENT ||
        fired.triageOutcome === TriageOutcome.ROUTINE_CLINICAL_REVIEW;
      return {
        status: referral
          ? RecommendationResponseStatus.REFERRAL_REQUIRED
          : RecommendationResponseStatus.PHARMACIST_REVIEW_REQUIRED,
        triageOutcome: fired.triageOutcome,
        reasonCodes: [`RED_FLAG_${fired.code}`],
        missingFields: [],
        protocolVersion: fired.protocolVersion ?? DEFAULT_PROTOCOL_VERSION,
        firedRules: [
          {
            code: fired.code,
            severity: fired.severity,
            message: fired.message,
          },
        ],
      };
    }

    // No red flags: required information must be present before recommending.
    const missingFields = this.requiredMissingFields(state);
    if (missingFields.length) {
      return {
        status: RecommendationResponseStatus.MORE_INFORMATION_REQUIRED,
        triageOutcome: TriageOutcome.MORE_INFORMATION_REQUIRED,
        reasonCodes: missingFields.map((field) => `MISSING_${field}`),
        missingFields,
        protocolVersion: DEFAULT_PROTOCOL_VERSION,
        firedRules: [],
      };
    }

    // No present symptoms and no complaint → nothing OTC-appropriate.
    const presentSymptoms = (state.symptoms ?? []).filter(
      (symptom) => symptom.status === ('PRESENT' as SymptomFindingStatus),
    );
    if (!presentSymptoms.length && !(state.complaintCodes ?? []).length) {
      return {
        status: RecommendationResponseStatus.NO_SUITABLE_OTC_OPTION,
        triageOutcome: TriageOutcome.NO_SUITABLE_OTC_OPTION,
        reasonCodes: ['NO_PRESENT_SYMPTOMS_NO_COMPLAINT'],
        missingFields: [],
        protocolVersion: DEFAULT_PROTOCOL_VERSION,
        firedRules: [],
      };
    }

    return {
      status: RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE,
      triageOutcome: TriageOutcome.SELF_CARE_ELIGIBLE,
      reasonCodes: ['NO_RED_FLAGS'],
      missingFields: [],
      protocolVersion: DEFAULT_PROTOCOL_VERSION,
      firedRules: [],
    };
  }

  /**
   * Rule predicate evaluation. `conditions` shape:
   *   { complaintCodes?: string[], presentSymptoms?: string[] (ANY-of),
   *     absentSymptoms?: string[] (ALL-of must be ABSENT),
   *     contraindications?: { code, matchValue? }[],
   *     requiredFields?: string[] }
   */
  private evaluateRule(rule: RedFlagRuleEntity, state: RxShopClerkingState): boolean {
    const conditions = (rule.conditions ?? {}) as Record<string, any>;

    if (conditions.complaintCodes?.length) {
      const complaints = (state.complaintCodes ?? []).map((code) => code.toUpperCase());
      if (!conditions.complaintCodes.some((code: string) => complaints.includes(code.toUpperCase()))) {
        return false;
      }
    }

    if (conditions.presentSymptoms?.length) {
      const present = new Set(
        (state.symptoms ?? [])
          .filter((symptom) => symptom.status === 'PRESENT')
          .map((symptom) => symptom.code.toUpperCase()),
      );
      const anyPresent = conditions.presentSymptoms.some((code: string) =>
        present.has(code.toUpperCase()),
      );
      if (!anyPresent) return false;
    }

    if (conditions.absentSymptoms?.length) {
      const byCode = new Map(
        (state.symptoms ?? []).map((symptom) => [symptom.code.toUpperCase(), symptom.status]),
      );
      const allAbsent = conditions.absentSymptoms.every(
        (code: string) => byCode.get(code.toUpperCase()) === 'ABSENT',
      );
      if (!allAbsent) return false;
    }

    if (conditions.contraindications?.length) {
      const answered = new Map(
        (state.contraindications ?? []).map((entry) => [entry.code.toUpperCase(), entry.value]),
      );
      const anyTrue = conditions.contraindications.some((condition: any) => {
        const value = answered.get(String(condition.code).toUpperCase());
        return isAffirmativeAnswer(value) || value === condition.matchValue;
      });
      if (!anyTrue) return false;
    }

    if (conditions.requiredFields?.length) {
      const info = state.additionalInfo ?? {};
      const missing = conditions.requiredFields.some(
        (field: string) => info[field] === undefined || info[field] === null || info[field] === '',
      );
      if (missing) return false;
    }

    return true;
  }

  /** Mandatory information check for the recommendation input contract. */
  private requiredMissingFields(state: RxShopClerkingState): string[] {
    const missing: string[] = [];
    if (!(state.complaintCodes ?? []).length) missing.push('complaintCodes');
    if (!(state.symptoms ?? []).length) missing.push('symptoms');
    const unanswered = (state.contraindications ?? []).filter(
      (entry) => (entry.status as string) === 'NOT_ASKED',
    );
    if (unanswered.length) missing.push('contraindicationScreening');
    return missing;
  }
}
