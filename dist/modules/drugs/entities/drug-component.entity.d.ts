import { PharmaceuticsEntity } from './pharmaceutics.entity';
export declare class DrugComponentEntity {
    id: string;
    name: string;
    pharmaceutics: PharmaceuticsEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
