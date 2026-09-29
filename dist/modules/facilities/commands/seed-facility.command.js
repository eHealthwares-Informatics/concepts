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
var SeedFacilityCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedFacilityCommand = void 0;
const nest_commander_1 = require("nest-commander");
const common_1 = require("@nestjs/common");
const facility_seeder_1 = require("../seeders/facility.seeder");
let SeedFacilityCommand = SeedFacilityCommand_1 = class SeedFacilityCommand extends nest_commander_1.CommandRunner {
    facilitySeeder;
    logger = new common_1.Logger(SeedFacilityCommand_1.name);
    constructor(facilitySeeder) {
        super();
        this.facilitySeeder = facilitySeeder;
    }
    async run(passedParams) {
        try {
            this.logger.log('Starting facility seeding process...');
            const result = await this.facilitySeeder.seedFacilities();
            if (result.success) {
                this.logger.log('✓ Facility seeding completed successfully');
                this.logger.log(`  States: ${result.stats.statesCreated}`);
                this.logger.log(`  LGAs: ${result.stats.lgasCreated}`);
                this.logger.log(`  Wards: ${result.stats.wardsCreated}`);
                this.logger.log(`  Facility Types: ${result.stats.facilityTypesCreated}`);
                this.logger.log(`  Facility Levels: ${result.stats.facilityLevelsCreated}`);
                this.logger.log(`  Derived Codes: ${result.stats.derivedCodesCreated}`);
                this.logger.log(`  Facilities Created: ${result.stats.facilitiesCreated}`);
                this.logger.log(`  Facilities Updated: ${result.stats.facilitiesUpdated}`);
                this.logger.log(`  Facility Attributes: ${result.stats.facilityAttributesCreated}`);
                if (result.stats.errors.length > 0) {
                    this.logger.warn(`  Errors: ${result.stats.errors.length}`);
                    for (const err of result.stats.errors.slice(0, 10)) {
                        this.logger.warn(`    - ${err}`);
                    }
                }
            }
            else {
                this.logger.error('✗ Facility seeding failed');
                this.logger.error(`  ${result.message}`);
                process.exit(1);
            }
        }
        catch (error) {
            this.logger.error(`Facility seeding command failed: ${error.message}`);
            process.exit(1);
        }
    }
};
exports.SeedFacilityCommand = SeedFacilityCommand;
exports.SeedFacilityCommand = SeedFacilityCommand = SeedFacilityCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nest_commander_1.Command)({
        name: 'seed:facility',
        description: 'Import facility registry data from Google Sheets',
    }),
    __metadata("design:paramtypes", [facility_seeder_1.FacilitySeederService])
], SeedFacilityCommand);
//# sourceMappingURL=seed-facility.command.js.map