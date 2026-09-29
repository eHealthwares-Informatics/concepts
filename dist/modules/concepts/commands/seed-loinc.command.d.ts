import { CommandRunner } from 'nest-commander';
import { LoincSeederService } from '../seeders/loinc.seeder';
export declare class SeedLoincCommand extends CommandRunner {
    private readonly loincSeeder;
    private readonly logger;
    constructor(loincSeeder: LoincSeederService);
    run(passedParams: string[]): Promise<void>;
}
