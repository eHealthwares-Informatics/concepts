export declare class ListPharmaceuticsDto {
    page?: number;
    limit?: number;
    search?: string;
    get offset(): number;
}
export declare class CreatePharmaceuticsDto {
    code: string;
    clinicalName?: string;
    brandNames?: string;
    drugClass?: string;
    bodySystem?: string;
    formulations?: string;
    chemicalConstituents?: string;
    pharmacology?: string;
    commonGenericName?: string;
    indications?: string;
    contraindications?: string;
    precautions?: string;
    warnings?: string;
    mechanismOfAction?: string;
    adverseEffects?: string;
    drugInteractions?: string;
    ivIncompatibilities?: string;
    foodInteractions?: string;
    traditionalMedicineEffects?: string;
    dosage?: string;
    dosePerAgeRange?: string;
    dosePerWeightRange?: string;
    missedDose?: string;
    bodyWeightAndAge?: string;
    physiologicalVariables?: string;
    pharmacokineticVariables?: string;
    diseaseVariables?: string;
    environmentalVariables?: string;
    extremesOfAge?: string;
    intercurrentIllness?: string;
    adherenceInfo?: string;
    prescriptionReasons?: string;
    recommendations?: string;
    generalDrugUse?: string;
    patientCounseling?: string;
    nursingConsiderations?: string;
    recommendedLabel?: string;
    isControlledSubstance?: boolean;
    pregnancyEffects?: string;
    breastfeedingEffects?: string;
    interactiveEffects?: string;
    renalImpairment?: string;
    hepaticImpairment?: string;
    drugComponentIds?: string[];
}
export declare class UpdatePharmaceuticsDto extends CreatePharmaceuticsDto {
}
