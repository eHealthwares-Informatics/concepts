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
var SeedDrugCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedDrugCommand = void 0;
const nest_commander_1 = require("nest-commander");
const common_1 = require("@nestjs/common");
const drug_seeder_1 = require("../seeders/drug.seeder");
let SeedDrugCommand = SeedDrugCommand_1 = class SeedDrugCommand extends nest_commander_1.CommandRunner {
    drugSeeder;
    logger = new common_1.Logger(SeedDrugCommand_1.name);
    constructor(drugSeeder) {
        super();
        this.drugSeeder = drugSeeder;
    }
    async run(passedParams) {
        this.logger.log('=== Starting drug seed ===');
        const result = await this.drugSeeder.seedDrugs();
        this.logger.log(`Drug seed: ${result.success ? '✓' : '✗'} — ${result.message}`);
    }
};
exports.SeedDrugCommand = SeedDrugCommand;
exports.SeedDrugCommand = SeedDrugCommand = SeedDrugCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nest_commander_1.Command)({
        name: 'seed:drug',
        description: 'Seed generic drugs, pharmaceutics, and drug components from Nigeria EDL data',
    }),
    __metadata("design:paramtypes", [drug_seeder_1.DrugSeederService])
], SeedDrugCommand);
//# sourceMappingURL=seed-drug.command.js.map