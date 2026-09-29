export type CategoryCodeEntry = {
    code: string;
    name: string;
};
export declare const therapeuticCategoryCodes: CategoryCodeEntry[];
export declare const pharmaceuticalCategoryCodes: CategoryCodeEntry[];
export declare const ndfCategoryCodes: CategoryCodeEntry[];
export declare const emdexCategoryCodes: CategoryCodeEntry[];
export declare const emdexDrugCodeToCategory: Record<string, string>;
