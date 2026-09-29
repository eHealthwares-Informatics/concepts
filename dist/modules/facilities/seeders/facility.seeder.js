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
var FacilitySeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilitySeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const facility_entity_1 = require("../entities/facility.entity");
const concept_attribute_value_entity_1 = require("../../concepts/entities/concept-attribute-value.entity");
const concept_coding_entity_1 = require("../../concepts/entities/concept-coding.entity");
const concept_attribute_entity_1 = require("../../concepts/entities/concept-attribute.entity");
const state_entity_1 = require("../entities/state.entity");
const lga_entity_1 = require("../entities/lga.entity");
const ward_entity_1 = require("../entities/ward.entity");
const concept_enum_1 = require("../../../common/enums/concept.enum");
let FacilitySeederService = FacilitySeederService_1 = class FacilitySeederService {
    facilityRepo;
    conceptCodeRepo;
    attributeRepo;
    valueRepo;
    stateRepo;
    lgaRepo;
    wardRepo;
    logger = new common_1.Logger(FacilitySeederService_1.name);
    constructor(facilityRepo, conceptCodeRepo, attributeRepo, valueRepo, stateRepo, lgaRepo, wardRepo) {
        this.facilityRepo = facilityRepo;
        this.conceptCodeRepo = conceptCodeRepo;
        this.attributeRepo = attributeRepo;
        this.valueRepo = valueRepo;
        this.stateRepo = stateRepo;
        this.lgaRepo = lgaRepo;
        this.wardRepo = wardRepo;
    }
    async seedFacilities(records = []) {
        const stats = {
            statesCreated: 0,
            lgasCreated: 0,
            wardsCreated: 0,
            facilityTypesCreated: 0,
            facilityLevelsCreated: 0,
            derivedCodesCreated: 0,
            facilitiesCreated: 0,
            facilitiesUpdated: 0,
            facilityAttributesCreated: 0,
            errors: [],
        };
        for (const record of records) {
            try {
                await this.upsertFacility(record, stats);
            }
            catch (err) {
                stats.errors.push(`${record.facilityId ?? record.unique_id ?? '<unknown>'}: ${err}`);
                this.logger.error(`Failed to seed facility ${record.facilityId ?? record.unique_id ?? '<unknown>'}: ${err}`);
            }
        }
        const success = stats.errors.length === 0;
        return {
            success,
            message: success
                ? `Seeded ${stats.facilitiesCreated + stats.facilitiesUpdated} facilities (${stats.facilitiesCreated} created, ${stats.facilitiesUpdated} updated) with ${stats.facilityAttributesCreated} attributes`
                : `Facility seeding completed with ${stats.errors.length} error(s)`,
            stats,
        };
    }
    async upsertFacility(row, stats) {
        const facilityId = row.facilityId ?? row.unique_id ?? undefined;
        if (!facilityId) {
            throw new Error('facilityId or unique_id is required');
        }
        const facilityName = row.facility_name ?? '';
        if (!facilityName) {
            throw new Error(`facility_name missing for ${facilityId}`);
        }
        const existing = await this.facilityRepo.findOne({ where: { facilityId } });
        if (existing) {
            return this.updateFacility(existing, row, stats);
        }
        return this.createFacility(row, stats);
    }
    async createFacility(row, stats) {
        const facility = this.facilityRepo.create({
            facilityId: row.facilityId ?? row.unique_id ?? undefined,
            uniqueId: row.unique_id ?? undefined,
            facilityName: row.facility_name ?? undefined,
            alternativeName: row.alt_facility_name ?? undefined,
            registrationNo: row.registration_no ?? undefined,
            registrationStatus: row.registration_status_code ?? row.registration_no ? undefined : undefined,
            emailAddress: row.email_address ?? undefined,
            phoneNumber: row.phone_number ?? undefined,
            ownershipCode: row.ownership_code ?? undefined,
            ownershipTypeCode: row.ownership_type_code ?? undefined,
            operationalStatusCode: row.operational_status_id ?? undefined,
            licenseStatus: row.license_status_code ?? undefined,
            latitude: row.latitude != null ? parseFloat(row.latitude) : undefined,
            longitude: row.longitude != null ? parseFloat(row.longitude) : undefined,
            website: row.website ?? undefined,
            alternateNumber: row.alternate_number ?? undefined,
            outpatient: row.outpatient ? row.outpatient === '1' || row.outpatient === 'true' || row.outpatient === 'yes' : false,
            inpatient: row.inpatient ? row.inpatient === '1' || row.inpatient === 'true' || row.inpatient === 'yes' : false,
            state: row.state_code ? { id: row.state_code } : undefined,
            lga: row.lga_code ? { id: row.lga_code } : undefined,
            ward: row.ward_code ? { id: row.ward_code } : undefined,
            facilityType: row.facility_type_id ? { id: row.facility_type_id } : undefined,
            facilityLevel: row.facility_level_code ? { id: row.facility_level_code } : undefined,
        });
        const saved = await this.facilityRepo.save(facility);
        stats.facilitiesCreated++;
        return saved;
    }
    async updateFacility(facility, row, stats) {
        facility.facilityName = row.facility_name ?? facility.facilityName;
        facility.alternativeName = row.alt_facility_name ?? facility.alternativeName;
        facility.registrationNo = row.registration_no ?? facility.registrationNo;
        facility.registrationStatus = row.registration_status_code ?? facility.registrationStatus;
        facility.emailAddress = row.email_address ?? facility.emailAddress;
        facility.phoneNumber = row.phone_number ?? facility.phoneNumber;
        facility.ownershipCode = row.ownership_code ?? facility.ownershipCode;
        facility.ownershipTypeCode = row.ownership_type_code ?? facility.ownershipTypeCode;
        facility.operationalStatusCode = row.operational_status_id ?? facility.operationalStatusCode;
        facility.licenseStatus = row.license_status_code ?? facility.licenseStatus;
        facility.latitude = row.latitude != null ? parseFloat(row.latitude) : facility.latitude;
        facility.longitude = row.longitude != null ? parseFloat(row.longitude) : facility.longitude;
        facility.website = row.website ?? facility.website;
        facility.alternateNumber = row.alternate_number ?? facility.alternateNumber;
        facility.outpatient = row.outpatient ? row.outpatient === '1' || row.outpatient === 'true' || row.outpatient === 'yes' : facility.outpatient;
        facility.inpatient = row.inpatient ? row.inpatient === '1' || row.inpatient === 'true' || row.inpatient === 'yes' : facility.inpatient;
        if (row.state_code) {
            const state = await this.stateRepo.findOne({ where: { code: row.state_code } });
            facility.state = state ? { id: state.id } : facility.state;
        }
        if (row.lga_code) {
            const lga = await this.lgaRepo.findOne({ where: { code: row.lga_code } });
            facility.lga = lga ? { id: lga.id } : facility.lga;
        }
        if (row.ward_code) {
            const ward = await this.wardRepo.findOne({ where: { code: row.ward_code } });
            facility.ward = ward ? { id: ward.id } : facility.ward;
        }
        if (row.facility_type_id) {
            facility.facilityType = { id: row.facility_type_id };
        }
        if (row.facility_level_code) {
            facility.facilityLevel = { id: row.facility_level_code };
        }
        stats.facilitiesUpdated++;
        return facility;
    }
    async upsertAttributes(facility, row, stats) {
        const coding = await this.ensureFacilityCoding(facility.id);
        const fields = new Set([
            'ownership_code', 'ownership_type_code', 'operational_status_id',
            'registration_status_code', 'license_status_code', 'latitude', 'longitude',
            'phone_number', 'alternate_number', 'email_address', 'website',
            'outpatient', 'inpatient', 'physical_location', 'facility_level_code',
            'facility_type_id',
        ]);
        const values = [];
        for (const [key, value] of Object.entries(row)) {
            if (!value || value.trim() === '')
                continue;
            if (!fields.has(key))
                continue;
            const attrDef = await this.resolveAttributeDef(key);
            values.push(this.valueRepo.create({
                concept: concept_enum_1.CodingConcept.FACILITY,
                conceptCode: coding,
                facility: { id: facility.id },
                attribute: attrDef,
                value: value,
            }));
        }
        if (values.length > 0) {
            await this.valueRepo.save(values);
            stats.facilityAttributesCreated += values.length;
        }
    }
    async ensureFacilityCoding(facilityId) {
        let coding = await this.conceptCodeRepo.findOne({
            where: { concept: concept_enum_1.CodingConcept.FACILITY, code: facilityId },
        });
        if (!coding) {
            coding = this.conceptCodeRepo.create({
                concept: concept_enum_1.CodingConcept.FACILITY,
                code: facilityId,
            });
            coding = await this.conceptCodeRepo.save(coding);
        }
        return coding;
    }
    async resolveAttributeDef(key) {
        const normalized = key.toLowerCase().replace(/\s+/g, '_');
        let attr = await this.attributeRepo.findOne({
            where: { concept: concept_enum_1.CodingConcept.FACILITY, code: normalized },
        });
        if (!attr) {
            attr = this.attributeRepo.create({
                concept: concept_enum_1.CodingConcept.FACILITY,
                code: normalized,
                name: normalized,
                dataType: 'string',
            });
            attr = await this.attributeRepo.save(attr);
        }
        return attr;
    }
};
exports.FacilitySeederService = FacilitySeederService;
exports.FacilitySeederService = FacilitySeederService = FacilitySeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(facility_entity_1.FacilityEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(concept_coding_entity_1.ConceptCodingEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(concept_attribute_entity_1.ConceptAttributeEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(concept_attribute_value_entity_1.ConceptAttributeValueEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(state_entity_1.StateEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(lga_entity_1.LgaEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(ward_entity_1.WardEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FacilitySeederService);
//# sourceMappingURL=facility.seeder.js.map