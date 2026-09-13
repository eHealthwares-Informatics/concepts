import { GenericProductEntity } from './generic-product.entity';
export declare class ManufacturerEntity {
    id: string;
    code: string;
    name: string;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    genericProducts: GenericProductEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
