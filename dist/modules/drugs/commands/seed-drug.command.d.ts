import { CommandRunner } from 'nest-commander';
import { DrugSeederService } from '../seeders/drug.seeder';
export declare class SeedDrugCommand extends CommandRunner {
    private readonly drugSeeder;
    private readonly logger;
    constructor(drugSeeder: DrugSeederService);
    run(passedParams: string[]): Promise<void>;
}
