import { GenericProductEntity } from './generic-product.entity';
import { DrugClassificationEntity } from './drug-classification.entity';
export declare class GenericDrugEntity {
    id: string;
    code: string;
    name: string;
    genericClass: string | null;
    pharmaceuticalClass: string | null;
    emdexCode: string | null;
    source: string | null;
    therapeuticCategoryCodes: string[] | null;
    pharmaceuticalCategoryCodes: string[] | null;
    ndfCategoryCodes: string[] | null;
    emdexCategoryCodes: string[] | null;
    genericProducts: GenericProductEntity[];
    classifications: DrugClassificationEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
