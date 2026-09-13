import { GenericProductEntity } from './generic-product.entity';
export declare class DosageFormEntity {
    id: string;
    code: string;
    name: string;
    description: string | null;
    genericProducts: GenericProductEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
