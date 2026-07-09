import { PharmaceuticsEntity } from './pharmaceutics.entity';
export declare class GenericProductEntity {
    id: string;
    code: string;
    name: string;
    therapeuticClass: string | null;
    dosageForm: string | null;
    strength: string | null;
    generalUse: string;
    adultDosage: string;
    pediatricDosage: string;
    isPrescriptionRequired: boolean;
    isControlledSubstance: boolean;
    pharmaceutics: PharmaceuticsEntity;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
