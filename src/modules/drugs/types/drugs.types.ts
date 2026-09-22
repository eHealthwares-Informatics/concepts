export type PharmaceuticsType = {
  id: string;
  code: string;
  clinicalName: string | null;
  brandNames: string | null;
  drugClass: string | null;
  bodySystem: string | null;
  formulations: string | null;
  chemicalConstituents: string | null;
  pharmacology: string | null;
  commonGenericName: string | null;
  // Clinical monograph
  indications: string | null;
  contraindications: string | null;
  precautions: string | null;
  warnings: string | null;
  mechanismOfAction: string | null;
  adverseEffects: string | null;
  drugInteractions: string | null;
  ivIncompatibilities: string | null;
  foodInteractions: string | null;
  traditionalMedicineEffects: string | null;
  // Dosing
  dosage: string | null;
  dosePerAgeRange: string | null;
  dosePerWeightRange: string | null;
  missedDose: string | null;
  // Patient variables
  bodyWeightAndAge: string | null;
  physiologicalVariables: string | null;
  pharmacokineticVariables: string | null;
  diseaseVariables: string | null;
  environmentalVariables: string | null;
  extremesOfAge: string | null;
  intercurrentIllness: string | null;
  // Adherence & prescribing
  adherenceInfo: string | null;
  prescriptionReasons: string | null;
  recommendations: string | null;
  generalDrugUse: string | null;
  patientCounseling: string | null;
  nursingConsiderations: string | null;
  recommendedLabel: string | null;
  // Regulatory
  isControlledSubstance: boolean;
  // Appendices
  pregnancyEffects: string | null;
  breastfeedingEffects: string | null;
  interactiveEffects: string | null;
  renalImpairment: string | null;
  hepaticImpairment: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type DrugClassificationType = {
  id: string;
  code: string;
  type: string;
  name: string;
};

export type GenericProductType = {
  id: string;
  code: string;
  name: string;
  therapeuticClass: string | null;
  pharmaceuticalClass: string | null;
  dosageForm: string | null;
  strength: string | null;
  generalUse: string | null;
  adultDosage: string | null;
  pediatricDosage: string | null;
  appendixDosages: string | null;
  emdexCode: string | null;
  atcCode: string | null;
  ndfGenericCode: string | null;
  genericDrug: GenericDrugType | null;
  classifications: DrugClassificationType[];
  isPrescriptionRequired: boolean;
  isControlledSubstance: boolean;
  pharmaceutics: PharmaceuticsType | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type GenericDrugType = {
  id: string;
  code: string;
  name: string;
  genericClass: string | null;
  pharmaceuticalClass: string | null;
  emdexCode: string | null;
  source: string | null;
  classifications: DrugClassificationType[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type DrugComponentType = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type FormulationType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type DosageFormType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ManufacturerType = {
  id: string;
  code: string;
  name: string;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
