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
var SeedLoincCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedLoincCommand = void 0;
const nest_commander_1 = require("nest-commander");
const common_1 = require("@nestjs/common");
const loinc_seeder_1 = require("../seeders/loinc.seeder");
let SeedLoincCommand = SeedLoincCommand_1 = class SeedLoincCommand extends nest_commander_1.CommandRunner {
    loincSeeder;
    logger = new common_1.Logger(SeedLoincCommand_1.name);
    constructor(loincSeeder) {
        super();
        this.loincSeeder = loincSeeder;
    }
    onApplicationBootstrap() {
        this.run([]);
    }
    async run(passedParams) {
        try {
            this.logger.log('Starting LOINC seeding process...');
            const triggeredBy = passedParams[0] || 'cli';
            const result = await this.loincSeeder.seedLoincData(triggeredBy);
            if (result.success) {
                this.logger.log('✓ Seeding completed successfully');
                this.logger.log(`  - Codes created: ${result.stats.codesCreated}`);
                this.logger.log(`  - Attributes created: ${result.stats.attributesCreated}`);
                this.logger.log(`  - Values created: ${result.stats.valuesCreated}`);
                if (result.stats.errors.length > 0) {
                    this.logger.warn(`  - Errors encountered: ${result.stats.errors.length}`);
                    result.stats.errors.slice(0, 5).forEach((error) => {
                        this.logger.warn(`    • ${error}`);
                    });
                    if (result.stats.errors.length > 5) {
                        this.logger.warn(`    ... and ${result.stats.errors.length - 5} more`);
                    }
                }
            }
            else {
                this.logger.error('✗ Seeding failed');
                this.logger.error(`  - ${result.message}`);
                process.exit(1);
            }
        }
        catch (error) {
            this.logger.error(`Seeding command failed: ${error.message}`);
            process.exit(1);
        }
    }
};
exports.SeedLoincCommand = SeedLoincCommand;
exports.SeedLoincCommand = SeedLoincCommand = SeedLoincCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nest_commander_1.Command)({
        name: 'seed:loinc',
        description: 'Import LOINC data from Google Sheets',
    }),
    __metadata("design:paramtypes", [loinc_seeder_1.LoincSeederService])
], SeedLoincCommand);
//# sourceMappingURL=seed-loinc.command.js.map