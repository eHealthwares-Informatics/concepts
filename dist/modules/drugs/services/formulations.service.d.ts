import { Repository } from 'typeorm';
import type { FormulationType } from '../types/drugs.types';
import { CreateFormulationDto, ListFormulationsDto, UpdateFormulationDto } from '../dto/formulations.dto';
import { FormulationEntity } from '../entities';
export declare class FormulationsService {
    private readonly formulationRepository;
    constructor(formulationRepository: Repository<FormulationEntity>);
    list(query: ListFormulationsDto): Promise<{
        data: FormulationType[];
        total: number;
    }>;
    get(id: string): Promise<FormulationType>;
    create(payload: CreateFormulationDto): Promise<FormulationType>;
    update(id: string, payload: UpdateFormulationDto): Promise<FormulationType>;
    remove(id: string): Promise<void>;
}
