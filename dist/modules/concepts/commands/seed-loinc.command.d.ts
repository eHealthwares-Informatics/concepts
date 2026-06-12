import { CommandRunner } from 'nest-commander';
import { OnApplicationBootstrap } from '@nestjs/common';
import { LoincSeederService } from '../seeders/loinc.seeder';
export declare class SeedLoincCommand extends CommandRunner implements OnApplicationBootstrap {
    private readonly loincSeeder;
    private readonly logger;
    constructor(loincSeeder: LoincSeederService);
    onApplicationBootstrap(): void;
    run(passedParams: string[]): Promise<void>;
}
