import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ComplaintSymptomEntity,
  ContraindicationEntity,
  RedFlagRuleEntity,
  SymptomEntity,
} from '../entities';
import type {
  ClerkingNextQuestionResult,
  ClerkingPlan,
  ClerkingQuestionSpec,
  RxShopClerkingState,
} from '../types/clinical-triage.types';
import { DEFAULT_PROTOCOL_VERSION } from './clinical-assessment.service';
import { normalizeClerkingState } from './clerking-state.util';
import { SEVERITY_ORDER } from './red-flag-rule.service';

/**
 * Clerking plan — turns the clinical knowledge base into the questions a
 * clerking conversation must ask.
 *
 * The conversation service owns no clinical question text: it posts the state
 * it has collected and gets back the next question to ask. Adding a symptom,
 * red flag or contraindication to the knowledge base therefore makes it
 * askable without touching (or redeploying) the conversation service.
 *
 * Ordering is deterministic (red flags → symptoms → contraindications →
 * context) so the same state always yields the same next question; an AI agent
 * may re-rank the candidates, but it can never invent one outside the plan.
 */
@Injectable()
export class ClerkingPlanService {
  private readonly logger = new Logger(ClerkingPlanService.name);

  constructor(
    @InjectRepository(SymptomEntity)
    private readonly symptoms: Repository<SymptomEntity>,
    @InjectRepository(ComplaintSymptomEntity)
    private readonly associations: Repository<ComplaintSymptomEntity>,
    @InjectRepository(RedFlagRuleEntity)
    private readonly redFlags: Repository<RedFlagRuleEntity>,
    @InjectRepository(ContraindicationEntity)
    private readonly contraindications: Repository<ContraindicationEntity>,
  ) {}

  /** Full, ordered question plan for the given complaints. */
  async plan(complaintCodes: string[]): Promise<ClerkingPlan> {
    const codes = [...new Set((complaintCodes ?? []).map((code) => String(code).toUpperCase()))];
    if (!codes.length) {
      return {
        complaintCodes: [],
        protocolVersion: DEFAULT_PROTOCOL_VERSION,
        questions: [],
      };
    }

    const questions = new Map<string, ClerkingQuestionSpec>();

    const add = (question: ClerkingQuestionSpec) => {
      const existing = questions.get(question.code);
      if (!existing || question.priority < existing.priority) {
        questions.set(question.code, question);
      }
    };

    // ── Red flags first: the rules decide which findings must be screened ──
    const rules = (await this.redFlags.find({ where: { isEnabled: true } })).filter((rule) => {
      const ruleComplaints: string[] = (rule.conditions ?? {}).complaintCodes ?? [];
      return (
        !ruleComplaints.length ||
        ruleComplaints.some((code: string) => codes.includes(String(code).toUpperCase()))
      );
    });

    const redFlagBySymptom = new Map<string, { ruleCode: string; severity: string }>();
    for (const rule of this.sortBySeverity(rules)) {
      for (const symptomCode of (rule.conditions ?? {}).presentSymptoms ?? []) {
        const key = String(symptomCode).toUpperCase();
        if (!redFlagBySymptom.has(key)) {
          redFlagBySymptom.set(key, { ruleCode: rule.code, severity: rule.severity });
        }
      }
    }

    // ── Symptoms: everything the complaint's associations point at ─────────
    const assocs = await this.associations
      .createQueryBuilder('assoc')
      .where('assoc.complaint_code IN (:...codes)', { codes })
      .getMany();
    const symptomCodes = new Set(assocs.map((assoc) => assoc.symptomCode.toUpperCase()));
    for (const code of redFlagBySymptom.keys()) symptomCodes.add(code);

    const symptomRows = symptomCodes.size
      ? await this.symptoms
          .createQueryBuilder('symptom')
          .where('symptom.code IN (:...codes)', { codes: [...symptomCodes] })
          .getMany()
      : [];
    const symptomByCode = new Map(symptomRows.map((row) => [row.code.toUpperCase(), row]));

    for (const code of symptomCodes) {
      const symptom = symptomByCode.get(code);
      const redFlag = redFlagBySymptom.get(code);
      const conditional = assocs.some(
        (assoc) =>
          assoc.symptomCode.toUpperCase() === code && assoc.applicability === 'CONDITIONAL',
      );
      add(
        this.buildSymptomQuestion({
          code,
          name: symptom?.name ?? this.humanize(code),
          questionText:
            (symptom?.interpretation as Record<string, any> | null)?.questionText ?? null,
          redFlag: redFlag ?? null,
          priority: redFlag ? 10 : conditional ? 20 : 30,
        }),
      );
    }

    // ── Contraindications that apply to these complaints ───────────────────
    const contraindicationRows = await this.contraindications.find();
    for (const row of contraindicationRows) {
      const applicability = row.applicability ?? {};
      const applicableComplaints: string[] = (applicability.complaints ?? []).map((code: string) =>
        String(code).toUpperCase(),
      );
      const applies =
        !applicableComplaints.length || applicableComplaints.some((code) => codes.includes(code));
      if (!applies) continue;
      add(this.buildContraindicationQuestion(row));
    }

    // ── Context: age gates pack eligibility (ageMin) ───────────────────────
    add({
      code: 'CONTEXT_AGE',
      questionId: 'clerking_context_age',
      clinicalAttribute: 'clerking.context.age',
      kind: 'CONTEXT',
      targetCode: 'AGE',
      text: 'How old is the patient? Reply with a number of years.',
      questionType: 'NUMBER',
      options: [],
      required: true,
      priority: 40,
      interpretation: { infoField: 'age' },
    });

    const questionsSorted = [...questions.values()].sort(
      (left, right) => left.priority - right.priority || left.code.localeCompare(right.code),
    );

    return {
      complaintCodes: codes,
      protocolVersion: DEFAULT_PROTOCOL_VERSION,
      questions: questionsSorted,
    };
  }

  /**
   * Next question for a partially answered session.
   *
   * Deterministic on purpose: the answer to a red-flag screen can escalate the
   * patient out of clerking, so question selection never waits on a model. The
   * caller may still reorder the returned plan for brevity; this method only
   * guarantees that a red-flag screen is never left unasked.
   */
  async nextQuestion(
    rawState: RxShopClerkingState,
    skipQuestionCodes: string[] = [],
  ): Promise<ClerkingNextQuestionResult> {
    const state = normalizeClerkingState(rawState);
    const complaintCodes = (state.complaintCodes ?? []).map((code) =>
      String(code).toUpperCase(),
    );
    const plan = await this.plan(complaintCodes);

    const answered = this.answeredQuestionCodes(state);
    const skipped = new Set(skipQuestionCodes.map((code) => String(code).toUpperCase()));
    const asked = new Set((state.askedQuestionCodes ?? []).map((code) => String(code).toUpperCase()));

    const pending = plan.questions.filter((question) => {
      if (skipped.has(question.code.toUpperCase())) return false;
      const keys = [question.code, question.questionId, question.clinicalAttribute];
      return !keys.some((key) => answered.has(String(key).toUpperCase()));
    });

    const next = pending[0] ?? null;
    return {
      status: next ? 'QUESTION' : 'COMPLETE',
      done: !next,
      question: next,
      remainingQuestionCodes: pending.slice(1).map((question) => question.code),
      remainingQuestions: pending.slice(1),
      complaintCodes: state.complaintCodes ?? [],
      protocolVersion: plan.protocolVersion,
    };
  }

  /**
   * Question codes the state already has an answer for. Matches on question
   * code, question id and clinical attribute so a client that only kept the
   * attribute (the workflow state map) still counts as answered.
   */
  private answeredQuestionCodes(state: RxShopClerkingState): Set<string> {
    const answered = new Set<string>();
    for (const answer of state.answers ?? []) {
      for (const key of [answer.questionCode, answer.questionId, answer.clinicalAttribute]) {
        if (key) answered.add(String(key).toUpperCase());
      }
    }

    // Answers the conversation engine already folded into its state map are
    // stored under their clinical attribute (`clerking.symptom.PAPULES`).
    const stateRecord = state as unknown as Record<string, any>;
    for (const [key, value] of Object.entries(stateRecord)) {
      if (!key.startsWith('clerking.')) continue;
      if (value === undefined || value === null || value === '') continue;
      answered.add(String(key).toUpperCase());
    }

    for (const symptom of state.symptoms ?? []) {
      if (symptom.status === 'PRESENT' || symptom.status === 'ABSENT') {
        answered.add(`SYMPTOM_${String(symptom.code).toUpperCase()}`);
      }
    }
    for (const entry of state.contraindications ?? []) {
      if (entry.status === 'ANSWERED') {
        answered.add(`CONTRAINDICATION_${String(entry.code).toUpperCase()}`);
      }
    }
    for (const field of Object.keys(state.additionalInfo ?? {})) {
      answered.add(`CONTEXT_${String(field).toUpperCase()}`);
    }

    return answered;
  }

  private buildSymptomQuestion(input: {
    code: string;
    name: string;
    questionText: string | null;
    redFlag: { ruleCode: string; severity: string } | null;
    priority: number;
  }): ClerkingQuestionSpec {
    return {
      code: `SYMPTOM_${input.code}`,
      questionId: `clerking_symptom_${input.code.toLowerCase()}`,
      clinicalAttribute: `clerking.symptom.${input.code}`,
      kind: input.redFlag ? 'RED_FLAG' : 'SYMPTOM',
      targetCode: input.code,
      text:
        input.questionText ??
        `Do you have ${this.withArticle(input.name)}? Reply 1 for yes, 2 for no.`,
      questionType: 'BOOLEAN',
      options: [
        { key: '1', label: 'Yes', value: 'PRESENT' },
        { key: '2', label: 'No', value: 'ABSENT' },
      ],
      required: true,
      priority: input.priority,
      interpretation: {
        symptomCode: input.code,
        ...(input.redFlag ? { redFlag: input.redFlag } : {}),
      },
    };
  }

  private buildContraindicationQuestion(row: ContraindicationEntity): ClerkingQuestionSpec {
    const applicability = row.applicability ?? {};
    return {
      code: `CONTRAINDICATION_${row.code}`,
      questionId: `clerking_contraindication_${row.code.toLowerCase()}`,
      clinicalAttribute: `clerking.contraindication.${row.code}`,
      kind: 'CONTRAINDICATION',
      targetCode: row.code,
      text:
        applicability.questionText ??
        `Is ${this.humanize(row.code)} present? Reply 1 for yes, 2 for no.`,
      questionType: 'BOOLEAN',
      options: [
        { key: '1', label: 'Yes', value: 'true' },
        { key: '2', label: 'No', value: 'false' },
      ],
      required: true,
      // Absolute contraindications outrank relative ones.
      priority: row.significance === 'ABSOLUTE' ? 35 : 36,
      interpretation: { contraindicationCode: row.code },
    };
  }

  private sortBySeverity(rules: RedFlagRuleEntity[]): RedFlagRuleEntity[] {
    return [...rules].sort((left, right) => {
      const leftIndex = SEVERITY_ORDER.indexOf(String(left.severity).toUpperCase());
      const rightIndex = SEVERITY_ORDER.indexOf(String(right.severity).toUpperCase());
      return (
        (leftIndex < 0 ? SEVERITY_ORDER.length : leftIndex) -
        (rightIndex < 0 ? SEVERITY_ORDER.length : rightIndex)
      );
    });
  }

  private withArticle(name: string): string {
    const lower = name.charAt(0).toLowerCase() + name.slice(1);
    return /^[aeiou]/i.test(lower) ? `an ${lower}` : `a ${lower}`;
  }

  private humanize(code: string): string {
    return String(code)
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .join(' ');
  }
}
