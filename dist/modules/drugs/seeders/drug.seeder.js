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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DrugSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const generic_drugs_data_1 = require("./generic-drugs.data");
function asNonEmptyString(value) {
    if (typeof value !== 'string')
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
function buildPharmacologyComponentMap() {
    const componentNamesByCode = new Map();
    for (const drug of generic_drugs_data_1.genericDrugData.drugs) {
        const names = Array.isArray(drug.drugComponentNames) ? drug.drugComponentNames : [];
        const codes = Array.isArray(drug.pharmaceuticsCode) ? drug.pharmaceuticsCode : [];
        for (const rawCode of codes) {
            const code = asNonEmptyString(rawCode);
            if (!code)
                continue;
            let bucket = componentNamesByCode.get(code);
            if (!bucket) {
                bucket = new Set();
                componentNamesByCode.set(code, bucket);
            }
            for (const rawName of names) {
                const name = asNonEmptyString(rawName);
                if (name)
                    bucket.add(name);
            }
        }
    }
    const output = new Map();
    for (const [code, names] of componentNamesByCode.entries()) {
        output.set(code, [...names]);
    }
    return output;
}
let DrugSeederService = DrugSeederService_1 = class DrugSeederService {
    componentRepository;
    pharmaceuticsRepository;
    genericRepository;
    logger = new common_1.Logger(DrugSeederService_1.name);
    constructor(componentRepository, pharmaceuticsRepository, genericRepository) {
        this.componentRepository = componentRepository;
        this.pharmaceuticsRepository = pharmaceuticsRepository;
        this.genericRepository = genericRepository;
    }
    async seedDrugs() {
        const stats = { drugComponents: 0, pharmaceutics: 0, genericProducts: 0 };
        try {
            const cache = await this.loadCaches();
            for (const componentName of Object.keys(generic_drugs_data_1.genericDrugData.drugComponentIndex)) {
                const name = asNonEmptyString(componentName);
                if (!name || cache.componentByName.has(name))
                    continue;
                const created = this.componentRepository.create({ name });
                const saved = await this.componentRepository.save(created);
                cache.componentByName.set(saved.name, saved);
                stats.drugComponents++;
            }
            const componentsByPharmacologyCode = buildPharmacologyComponentMap();
            for (const [rawCode, info] of Object.entries(generic_drugs_data_1.genericDrugData.pharmaceuticsIndex)) {
                const code = asNonEmptyString(rawCode);
                if (!code || cache.pharmaceuticsByCode.has(code))
                    continue;
                const componentNames = componentsByPharmacologyCode.get(code) ?? [];
                const componentEntities = componentNames
                    .map((name) => cache.componentByName.get(name))
                    .filter((entry) => Boolean(entry));
                const created = this.pharmaceuticsRepository.create({
                    code,
                    clinicalName: info.clinicalName,
                    drugClass: info.drugClass,
                    pharmaceutics: info.pharmacology,
                    indications: info.indications,
                    contraindications: info.contraindications,
                    mechanism: info.mechanism,
                    drugComponents: componentEntities,
                });
                const saved = await this.pharmaceuticsRepository.save(created);
                cache.pharmaceuticsByCode.set(saved.code, saved);
                stats.pharmaceutics++;
            }
            for (const drug of generic_drugs_data_1.genericDrugData.drugs) {
                const code = asNonEmptyString(drug.code);
                if (!code || cache.genericByCode.has(code))
                    continue;
                const pharmacologyCode = drug.pharmaceuticsCode.find((item) => asNonEmptyString(item));
                if (!pharmacologyCode)
                    continue;
                const pharmaceutics = cache.pharmaceuticsByCode.get(pharmacologyCode);
                if (!pharmaceutics)
                    continue;
                const created = this.genericRepository.create({
                    code,
                    name: drug.name,
                    generalUse: drug.generalUse,
                    adultDosage: drug.adultDosage,
                    pediatricDosage: drug.pediatricDosage,
                    isPrescriptionRequired: false,
                    isControlledSubstance: false,
                    pharmaceutics,
                });
                const saved = await this.genericRepository.save(created);
                cache.genericByCode.set(saved.code, saved);
                stats.genericProducts++;
            }
            this.logger.log(`Seeded: ${stats.drugComponents} components, ${stats.pharmaceutics} pharmaceutics, ${stats.genericProducts} generic products`);
            return { success: true, message: `Seeded ${stats.genericProducts} generic products, ${stats.pharmaceutics} pharmaceutics, ${stats.drugComponents} components`, stats };
        }
        catch (err) {
            this.logger.error(`Drug seeding failed: ${err.message}`);
            return { success: false, message: err.message, stats };
        }
    }
    async loadCaches() {
        const [components, pharmaceutics, generics] = await Promise.all([
            this.componentRepository.find({ relations: { pharmaceutics: true } }),
            this.pharmaceuticsRepository.find({ relations: { drugComponents: true } }),
            this.genericRepository.find({ relations: { pharmaceutics: true } }),
        ]);
        return {
            componentByName: new Map(components.map((entity) => [entity.name, entity])),
            pharmaceuticsByCode: new Map(pharmaceutics.map((entity) => [entity.code, entity])),
            genericByCode: new Map(generics.map((entity) => [entity.code, entity])),
        };
    }
};
exports.DrugSeederService = DrugSeederService;
exports.DrugSeederService = DrugSeederService = DrugSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.DrugComponentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.PharmaceuticsEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.GenericProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DrugSeederService);
//# sourceMappingURL=drug.seeder.js.map