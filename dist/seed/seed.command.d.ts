import { CommandRunner } from 'nest-commander';
import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeedOrchestratorService } from './seed-orchestrator.service';
export declare class SeedCommand extends CommandRunner implements OnApplicationBootstrap {
    private readonly seedOrchestrator;
    private readonly configService;
    private readonly logger;
    constructor(seedOrchestrator: SeedOrchestratorService, configService: ConfigService);
    onApplicationBootstrap(): void;
    run(passedParams: string[]): Promise<void>;
}
