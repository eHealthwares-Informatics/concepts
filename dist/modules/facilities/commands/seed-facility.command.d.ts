import { CommandRunner } from 'nest-commander';
import { FacilitySeederService } from '../seeders/facility.seeder';
export declare class SeedFacilityCommand extends CommandRunner {
    private readonly facilitySeeder;
    private readonly logger;
    constructor(facilitySeeder: FacilitySeederService);
    run(passedParams: string[]): Promise<void>;
}
