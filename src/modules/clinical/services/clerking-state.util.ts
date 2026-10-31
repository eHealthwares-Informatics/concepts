import type { ClerkingAnswerInput, RxShopClerkingState } from '../types/clinical-triage.types';

const SYMPTOM_PREFIX = 'clerking.symptom.';
const CONTRAINDICATION_PREFIX = 'clerking.contraindication.';
const CONTEXT_PREFIX = 'clerking.context.';

function isPresent(value: unknown): boolean | null {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['present', 'true', 'yes', 'y', '1'].includes(normalized)) return true;
  if (['absent', 'false', 'no', 'n', '2'].includes(normalized)) return false;
  return null;
}

/**
 * Fold the conversation engine's flat attribute map into canonical clerking
 * state.
 *
 * The workflow stores every answer under the question's clinical attribute
 * (`clerking.symptom.PAPULES`), because that is what `WorkflowInstance.state`
 * holds. This turns those attributes back into `symptoms`, `contraindications`
 * and `additionalInfo` so the assessment engine and the question planner see
 * the same contract the REST callers use. Explicit arrays always win — a caller
 * that sends canonical state is never re-derived from attributes.
 */
export function normalizeClerkingState(
  raw: RxShopClerkingState | Record<string, any> | null | undefined,
): RxShopClerkingState {
  const state = (raw ?? {}) as Record<string, any>;

  const symptoms = Array.isArray(state.symptoms) ? [...state.symptoms] : [];
  const contraindications = Array.isArray(state.contraindications)
    ? [...state.contraindications]
    : [];
  const additionalInfo: Record<string, unknown> = { ...(state.additionalInfo ?? {}) };
  const answers: ClerkingAnswerInput[] = Array.isArray(state.answers)
    ? [...state.answers]
    : [];

  const symptomByCode = new Map(
    symptoms.map((symptom: any) => [String(symptom.code).toUpperCase(), symptom]),
  );
  const contraindicationByCode = new Map(
    contraindications.map((entry: any) => [String(entry.code).toUpperCase(), entry]),
  );

  for (const [key, value] of Object.entries(state)) {
    if (value === undefined || value === null || value === '') continue;

    if (key.startsWith(SYMPTOM_PREFIX)) {
      const code = key.slice(SYMPTOM_PREFIX.length).toUpperCase();
      if (!code || symptomByCode.has(code)) continue;
      const present = isPresent(value);
      if (present === null) continue;
      symptomByCode.set(code, { code, status: present ? 'PRESENT' : 'ABSENT' });
      answers.push({
        questionCode: `SYMPTOM_${code}`,
        clinicalAttribute: key,
        values: [value],
      });
      continue;
    }

    if (key.startsWith(CONTRAINDICATION_PREFIX)) {
      const code = key.slice(CONTRAINDICATION_PREFIX.length).toUpperCase();
      if (!code || contraindicationByCode.has(code)) continue;
      const present = isPresent(value);
      if (present === null) continue;
      contraindicationByCode.set(code, { code, value: present, status: 'ANSWERED' });
      answers.push({
        questionCode: `CONTRAINDICATION_${code}`,
        clinicalAttribute: key,
        values: [value],
      });
      continue;
    }

    if (key.startsWith(CONTEXT_PREFIX)) {
      const field = key.slice(CONTEXT_PREFIX.length);
      if (!field || additionalInfo[field] !== undefined) continue;
      const numeric = Number(value);
      additionalInfo[field] = Number.isFinite(numeric) && `${value}`.trim() !== ''
        ? numeric
        : value;
      answers.push({
        questionCode: `CONTEXT_${field.toUpperCase()}`,
        clinicalAttribute: key,
        values: [value],
      });
    }
  }

  return {
    sessionId: state.sessionId ?? '',
    questionnaireCode: state.questionnaireCode ?? 'RXSHOP_CLERKING_V1',
    complaintCodes: (state.complaintCodes ?? []).map((code: string) =>
      String(code).toUpperCase(),
    ),
    symptoms: [...symptomByCode.values()],
    contraindications: [...contraindicationByCode.values()],
    additionalInfo,
    ...(state.askedQuestionCodes ? { askedQuestionCodes: state.askedQuestionCodes } : {}),
    ...(state.prescriptions ? { prescriptions: state.prescriptions } : {}),
    ...(state.triageOutcome ? { triageOutcome: state.triageOutcome } : {}),
    ...(answers.length ? { answers } : {}),
  };
}
