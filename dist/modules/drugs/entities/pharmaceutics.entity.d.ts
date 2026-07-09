import { GenericProductEntity } from './generic-product.entity';
import { DrugComponentEntity } from './drug-component.entity';
export declare class PharmaceuticsEntity {
    id: string;
    code: string;
    commonBrandName: string | null;
    commonGenericName: string | null;
    clinicalName: string | null;
    drugClass: string | null;
    chemicalConstituents: string | null;
    pharmaceutics: string | null;
    indications: string | null;
    contraindications: string | null;
    mechanism: string | null;
    missedDose: string | null;
    drugInteractions: string | null;
    dosage: string | null;
    genericProducts: GenericProductEntity[];
    drugComponents: DrugComponentEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
