import { Repository } from 'typeorm';
import type { DosageFormType } from '../types/drugs.types';
import { CreateDosageFormDto, ListDosageFormsDto, UpdateDosageFormDto } from '../dto/dosage-forms.dto';
import { DosageFormEntity } from '../entities';
export declare class DosageFormsService {
    private readonly dosageFormRepository;
    constructor(dosageFormRepository: Repository<DosageFormEntity>);
    list(query: ListDosageFormsDto): Promise<{
        data: DosageFormType[];
        total: number;
    }>;
    get(id: string): Promise<DosageFormType>;
    create(payload: CreateDosageFormDto): Promise<DosageFormType>;
    update(id: string, payload: UpdateDosageFormDto): Promise<DosageFormType>;
    remove(id: string): Promise<void>;
}
