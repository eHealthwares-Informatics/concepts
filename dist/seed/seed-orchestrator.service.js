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
var SeedOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const loinc_seeder_1 = require("../modules/concepts/seeders/loinc.seeder");
const icd_seeder_1 = require("../modules/concepts/seeders/icd.seeder");
const facility_seeder_1 = require("../modules/facilities/seeders/facility.seeder");
const drug_seeder_1 = require("../modules/drugs/seeders/drug.seeder");
let SeedOrchestratorService = SeedOrchestratorService_1 = class SeedOrchestratorService {
    facilitySeeder;
    loincSeeder;
    icdSeeder;
    drugSeeder;
    logger = new common_1.Logger(SeedOrchestratorService_1.name);
    constructor(facilitySeeder, loincSeeder, icdSeeder, drugSeeder) {
        this.facilitySeeder = facilitySeeder;
        this.loincSeeder = loincSeeder;
        this.icdSeeder = icdSeeder;
        this.drugSeeder = drugSeeder;
    }
    async seedAll() {
        const result = {
            facility: { success: false, errors: 0 },
            loinc: { success: false, errors: 0 },
            icd: { success: false, errors: 0 },
            drug: { success: false, errors: 0 },
            totalErrors: 0,
        };
        try {
            this.logger.log('=== STEP 2/4: Seeding LOINC ===');
            const loincResult = await this.loincSeeder.seedLoincData('seed:all');
            result.loinc = {
                success: loincResult.success,
                errors: loincResult.stats.errors.length,
            };
            this.logger.log(`LOINC seeding ${loincResult.success ? '✓' : '✗'} (${loincResult.stats.errors.length} errors)`);
        }
        catch (err) {
            result.loinc = { success: false, errors: 1 };
            this.logger.error(`LOINC seeding failed: ${err.message}`);
        }
        try {
            this.logger.log('=== STEP 3/4: Seeding ICD-10 ===');
            const icdResult = await this.icdSeeder.seedICDData('seed:all');
            result.icd = {
                success: icdResult.success,
                errors: icdResult.stats.errors.length,
            };
            this.logger.log(`ICD-10 seeding ${icdResult.success ? '✓' : '✗'} (${icdResult.stats.errors.length} errors)`);
        }
        catch (err) {
            result.icd = { success: false, errors: 1 };
            this.logger.error(`ICD-10 seeding failed: ${err.message}`);
        }
        try {
            this.logger.log('=== STEP 4/4: Seeding drugs ===');
            const drugResult = await this.drugSeeder.seedDrugs();
            result.drug = {
                success: drugResult.success,
                errors: drugResult.success ? 0 : 1,
            };
            this.logger.log(`Drug seeding ${drugResult.success ? '✓' : '✗'}`);
        }
        catch (err) {
            result.drug = { success: false, errors: 1 };
            this.logger.error(`Drug seeding failed: ${err.message}`);
        }
        try {
            this.logger.log('=== STEP 1/4: Seeding facilities ===');
            const facilityResult = await this.facilitySeeder.seedFacilities();
            result.facility = {
                success: facilityResult.success,
                errors: facilityResult.stats.errors.length,
            };
            this.logger.log(`Facility seeding ${facilityResult.success ? '✓' : '✗'} (${facilityResult.stats.errors.length} errors)`);
        }
        catch (err) {
            result.facility = { success: false, errors: 1 };
            this.logger.error(`Facility seeding failed: ${err.message}`);
        }
        result.totalErrors = result.facility.errors + result.loinc.errors + result.icd.errors + result.drug.errors;
        return result;
    }
};
exports.SeedOrchestratorService = SeedOrchestratorService;
exports.SeedOrchestratorService = SeedOrchestratorService = SeedOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [facility_seeder_1.FacilitySeederService,
        loinc_seeder_1.LoincSeederService,
        icd_seeder_1.ICDSeederService,
        drug_seeder_1.DrugSeederService])
], SeedOrchestratorService);
//# sourceMappingURL=seed-orchestrator.service.js.map