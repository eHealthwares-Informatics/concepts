import { CommandRunner } from 'nest-commander';
import { ICDSeederService } from '../seeders/icd.seeder';
export declare class SeedICDCommand extends CommandRunner {
    private readonly icdSeeder;
    private readonly logger;
    constructor(icdSeeder: ICDSeederService);
    run(passedParams: string[]): Promise<void>;
}
