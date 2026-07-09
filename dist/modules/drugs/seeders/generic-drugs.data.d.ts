export type DrugComponentIndexEntry = {
    name: string;
};
export type Pharmaceutics = {
    code: string;
    clinicalName: string;
    drugClass: string;
    pharmacology: string;
    indications: string;
    contraindications: string;
    mechanism: string;
};
export type GenericDrug = {
    code: string;
    name: string;
    genericClass: string;
    pharmaceuticalClass: string;
    generalUse: string;
    adultDosage: string;
    pediatricDosage: string;
    appendixDosages: any[];
    pharmaceuticsCode: string[];
    drugComponentNames: string[];
};
export type GenericDrugSeedData = {
    drugs: GenericDrug[];
    pharmaceuticsIndex: Record<string, Pharmaceutics>;
    drugComponentIndex: Record<string, DrugComponentIndexEntry>;
};
export declare const genericDrugData: GenericDrugSeedData;
export declare const genericDrugs: GenericDrug[];
export declare const pharmaceuticsIndex: Record<string, Pharmaceutics>;
export declare const drugComponentIndex: Record<string, DrugComponentIndexEntry>;
