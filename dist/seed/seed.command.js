"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SeedCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedCommand = void 0;
const nest_commander_1 = require("nest-commander");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seed_orchestrator_service_1 = require("./seed-orchestrator.service");
let SeedCommand = SeedCommand_1 = class SeedCommand extends nest_commander_1.CommandRunner {
    seedOrchestrator;
    configService;
    logger = new common_1.Logger(SeedCommand_1.name);
    constructor(seedOrchestrator, configService) {
        super();
        this.seedOrchestrator = seedOrchestrator;
        this.configService = configService;
    }
    onApplicationBootstrap() {
        const seedOnStart = this.configService.get('SEED_ON_START', 'false');
        if (seedOnStart.toLowerCase() === 'true') {
            this.logger.log('SEED_ON_START=true — running all seeders...');
            this.run([]).catch((err) => {
                this.logger.error(`Seed-on-start failed: ${err.message}`);
            });
        }
    }
    async run(passedParams) {
        this.logger.log('=== Starting full seed (dictionary → facility → LOINC → ICD-10 → drugs) ===');
        const result = await this.seedOrchestrator.seedAll();
        this.logger.log('=== Seed results ===');
        this.logger.log(`  Facility:    ${result.facility.success ? '✓' : '✗'} (${result.facility.errors} errors)`);
        this.logger.log(`  Dictionary:  ${result.dictionary.success ? '✓' : '✗'} (${result.dictionary.errors} errors)`);
        this.logger.log(`  LOINC:       ${result.loinc.success ? '✓' : '✗'} (${result.loinc.errors} errors)`);
        this.logger.log(`  ICD-10:      ${result.icd.success ? '✓' : '✗'} (${result.icd.errors} errors)`);
        this.logger.log(`  Drugs:       ${result.drug.success ? '✓' : '✗'} (${result.drug.errors} errors)`);
        this.logger.log(`  Total:       ${result.totalErrors} errors across all seeders`);
        if (result.totalErrors > 0) {
            this.logger.warn('Seeding completed with errors — check logs above for details');
        }
    }
};
exports.SeedCommand = SeedCommand;
exports.SeedCommand = SeedCommand = SeedCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nest_commander_1.Command)({
        name: 'seed:all',
        description: 'Run all seeders (dictionary → facility → LOINC → ICD-10 → drugs) in sequence',
    }),
    __metadata("design:paramtypes", [seed_orchestrator_service_1.SeedOrchestratorService,
        config_1.ConfigService])
], SeedCommand);
//# sourceMappingURL=seed.command.js.map