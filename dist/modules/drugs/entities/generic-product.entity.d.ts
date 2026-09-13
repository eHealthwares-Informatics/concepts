import { PharmaceuticsEntity } from './pharmaceutics.entity';
import { FormulationEntity } from './formulation.entity';
import { DosageFormEntity } from './dosage-form.entity';
import { ManufacturerEntity } from './manufacturer.entity';
export declare class GenericProductEntity {
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
    isPrescriptionRequired: boolean;
    isControlledSubstance: boolean;
    pharmaceutics: PharmaceuticsEntity;
    formulation: FormulationEntity | null;
    dosageFormRef: DosageFormEntity | null;
    manufacturer: ManufacturerEntity | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
