import { GenericDrugEntity } from './generic-drug.entity';
import { GenericProductEntity } from './generic-product.entity';
export declare class DrugClassificationEntity {
    id: string;
    code: string;
    type: string;
    name: string;
    description: string | null;
    source: string | null;
    url: string | null;
    genericDrugs: GenericDrugEntity[];
    genericProducts: GenericProductEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
