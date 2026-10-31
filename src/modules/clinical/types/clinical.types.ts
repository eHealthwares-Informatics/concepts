import type {
  ClinicalStatus,
  PrescriptionLine,
  RecommendationResponseStatus,
  TriageOutcome,
  TreatmentPackStatus,
} from './clinical-triage.types';

export interface ComplaintType {
  id: string;
  code: string;
  name: string;
  slug: string;
  category: string;
  synonyms: string[];
  localExpressions: string[];
  status: ClinicalStatus;
  sourceRefs: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomType {
  id: string;
  code: string;
  name: string;
  synonyms: string[];
  category: string;
  interpretation: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintSymptomType {
  id: string;
  complaintCode: string;
  symptomCode: string;
  applicability: string;
  questionRef: string | null;
  conditionalRules: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalQuestionType {
  id: string;
  code: string;
  questionId: string;
  clinicalAttribute: string;
  responseInterpretation: Record<string, any>;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface RedFlagRuleType {
  id: string;
  code: string;
  conditions: Record<string, any>;
  severity: string;
  triageOutcome: TriageOutcome;
  requiredAction: string;
  message: string;
  protocolVersion: string;
  evidence: Record<string, any>;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContraindicationType {
  id: string;
  code: string;
  applicability: Record<string, any>;
  significance: string;
  medicineExclusions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentPackItemType {
  id: string;
  itemType: 'GENERIC_MEDICINE' | 'SUPPORTIVE_CARE' | 'COUNSELLING';
  genericDrugId: string | null;
  genericDrugCode: string | null;
  /** Human-readable generic name, resolved at recommendation time. */
  genericDrugName?: string | null;
  supportiveCareRef: string | null;
  protocolRegimenCode: string | null;
  instructions: Record<string, any>;
  sequence: number;
  required: boolean;
}

export interface TreatmentPackType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  complaintCodes: string[];
  eligibilityRules: Record<string, any>;
  exclusionRules: Record<string, any>;
  evidence: Record<string, any>;
  status: TreatmentPackStatus;
  version: number;
  items: TreatmentPackItemType[];
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalEvidenceType {
  id: string;
  referencedEntity: string;
  source: string;
  edition: string;
  section: string | null;
  publicationDate: string | null;
  reviewedBy: string | null;
  protocolVersion: string;
  createdAt: string;
  updatedAt: string;
}

/** Generic medicine view (backed by the drugs module's `generic_drugs`). */
export interface ClinicalGenericMedicineType {
  id: string;
  code: string;
  name: string;
  isOtc: boolean;
  ingredients: Record<string, any> | null;
  strengths: string[] | null;
  routes: string[] | null;
  dosageForms: string[] | null;
  restrictions: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalFiredRuleType {
  code: string;
  severity: string;
  message: string;
}

export interface ClinicalAssessmentResult {
  status: RecommendationResponseStatus;
  triageOutcome: TriageOutcome;
  reasonCodes: string[];
  missingFields: string[];
  protocolVersion: string;
  firedRules: ClinicalFiredRuleType[];
}

export interface ResolvedPackType {
  packId: string;
  packCode: string;
  name: string;
  version: number;
  items: TreatmentPackItemType[];
  counselling: Array<Record<string, any>>;
  warnings: Record<string, any>;
  requiresPharmacistReview: boolean;
}

export interface AvailableItemType {
  genericMedicineCode: string;
  genericProductCode: string;
  itemCode: string | null;
  requiredAttributes: Record<string, any>;
  mappingStatus: string;
}

export interface RecommendationResult {
  status: RecommendationResponseStatus;
  triageOutcome: TriageOutcome;
  reasonCodes: string[];
  missingFields?: string[];
  protocolVersion: string;
  recommendations?: Array<{
    packId: string;
    packCode: string;
    name: string;
    version: number;
    items: TreatmentPackItemType[];
    counselling: Array<Record<string, any>>;
    warnings: Record<string, any>;
    itemsAvailability: AvailableItemType[];
  }>;
  notifications?: Array<{ type: string; message: string }>;
  pharmacistReviewRequired?: boolean;
  availableItems?: AvailableItemType[];
  /**
   * Flattened prescription lines for every resolved pack item. Always an array
   * (possibly empty) so downstream mappers never have to branch on a single
   * medicine: one pack can carry several generics plus counselling items.
   */
  prescriptions?: PrescriptionLine[];
}
