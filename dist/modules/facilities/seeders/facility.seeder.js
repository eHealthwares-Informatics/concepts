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
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const facility_sheets_service_1 = require("../../../common/services/facility-sheets.service");
const entities_1 = require("../../concepts/entities");
const facility_entity_1 = require("../entities/facility.entity");
const facility_attribute_entity_1 = require("../entities/facility-attribute.entity");
const state_entity_1 = require("../entities/state.entity");
const lga_entity_1 = require("../entities/lga.entity");
const ward_entity_1 = require("../entities/ward.entity");
const facility_type_entity_1 = require("../entities/facility-type.entity");
const facility_level_entity_1 = require("../entities/facility-level.entity");
const FACILITY_ATTRIBUTE_FIELDS = new Set([
    'beds', 'doctors', 'pharmacists', 'dentist', 'pharmacy_technicians',
    'nurses', 'lab_scientists', 'midwifes', 'lab_technicians',
    'nurse_midwife', 'him_officers', 'community_health_officer',
    'community_extension_workers', 'jun_community_extension_worker',
    'dental_technicians', 'env_health_officers', 'attendants',
    'onsite_laboratory', 'onsite_imaging', 'onsite_pharmarcy',
    'mortuary_services', 'ambulance_services',
    'physical_location', 'postal_address',
    'operational_days', 'operational_hours',
    'start_date', 'close_date', 'image_url',
]);
let FacilitySeederService = FacilitySeederService_1 = class FacilitySeederService {
    facilitySheetsService;
    conceptCodeRepository;
    attributeRepository;
    valueRepository;
    facilityRepository;
    facilityAttributeRepository;
    stateRepository;
    lgaRepository;
    wardRepository;
    facilityTypeRepository;
    facilityLevelRepository;
    logger = new common_1.Logger(FacilitySeederService_1.name);
    constructor(facilitySheetsService, conceptCodeRepository, attributeRepository, valueRepository, facilityRepository, facilityAttributeRepository, stateRepository, lgaRepository, wardRepository, facilityTypeRepository, facilityLevelRepository) {
        this.facilitySheetsService = facilitySheetsService;
        this.conceptCodeRepository = conceptCodeRepository;
        this.attributeRepository = attributeRepository;
        this.valueRepository = valueRepository;
        this.facilityRepository = facilityRepository;
        this.facilityAttributeRepository = facilityAttributeRepository;
        this.stateRepository = stateRepository;
        this.lgaRepository = lgaRepository;
        this.wardRepository = wardRepository;
        this.facilityTypeRepository = facilityTypeRepository;
        this.facilityLevelRepository = facilityLevelRepository;
    }
    async seedFacilities() {
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
        try {
            this.logger.log('Starting facility data import...');
            const sheetNames = await this.facilitySheetsService.getSheetNames();
            this.logger.log(`Found ${sheetNames.length} sheets`);
            const refSheets = ['state', 'lga', 'ward', 'facility_type', 'facility_level'];
            const refData = {};
            for (const name of refSheets) {
                if (sheetNames.includes(name)) {
                    refData[name] = await this.facilitySheetsService.fetchSheetData(name);
                    this.logger.log(`Loaded ${name}: ${refData[name].rows.length} rows`);
                }
            }
            const facilitySheetNames = sheetNames.filter(n => n.startsWith('facility_'));
            this.logger.log(`Found ${facilitySheetNames.length} facility sheets`);
            const allDerivedCodes = {
                ownershipCodes: new Set(),
                ownershipTypeCodes: new Set(),
                operationalStatusIds: new Set(),
                registrationStatusCodes: new Set(),
                licenseStatusCodes: new Set(),
            };
            for (const sheetName of facilitySheetNames) {
                const data = await this.facilitySheetsService.fetchSheetData(sheetName);
                for (const row of data.rows) {
                    this.collectDerivedCodes(row, allDerivedCodes);
                }
            }
            await this.importReferenceData(refData, stats);
            await this.importDerivedCodes(allDerivedCodes, stats);
            await this.ensureHierarchyAttributes();
            const lookupMaps = await this.buildLookupMaps();
            for (const sheetName of facilitySheetNames) {
                const data = await this.facilitySheetsService.fetchSheetData(sheetName);
                this.logger.log(`Processing ${sheetName}: ${data.rows.length} rows`);
                const syncUpdates = [];
                for (let rowIdx = 0; rowIdx < data.rows.length; rowIdx++) {
                    try {
                        const facility = await this.upsertFacility(data.rows[rowIdx], lookupMaps, stats);
                        if (facility) {
                            syncUpdates.push({
                                rowIndex: rowIdx + 1,
                                uuid: facility.id,
                                syncStatus: 'SYNCED',
                                syncMessage: `Imported successfully at ${new Date().toISOString()}`,
                                syncTime: new Date().toISOString(),
                            });
                        }
                    }
                    catch (err) {
                        stats.errors.push(`[${sheetName}] row facility=${data.rows[rowIdx].facility_name || data.rows[rowIdx].name || '?'}: ${err.message}`);
                        syncUpdates.push({
                            rowIndex: rowIdx + 1,
                            uuid: '',
                            syncStatus: 'ERROR',
                            syncMessage: err.message,
                            syncTime: new Date().toISOString(),
                        });
                    }
                }
                if (syncUpdates.length > 0) {
                    try {
                        const cells = await this.facilitySheetsService.writeSyncData(sheetName, syncUpdates);
                        this.logger.log(`  Wrote sync data back for ${syncUpdates.length} rows (${cells} cells)`);
                    }
                    catch (err) {
                        this.logger.warn(`  Failed to write sync data back: ${err.message}`);
                    }
                }
            }
            this.logger.log('Facility import completed successfully');
            return {
                success: true,
                message: `Imported ${stats.facilitiesCreated} facilities (${stats.facilitiesUpdated} updated), ${stats.statesCreated} states, ${stats.lgasCreated} LGAs, ${stats.wardsCreated} wards`,
                stats,
            };
        }
        catch (err) {
            this.logger.error(`Facility import failed: ${err.message}`, err.stack);
            stats.errors.push(err.message);
            return { success: false, message: `Import failed: ${err.message}`, stats };
        }
    }
    resolveColumn(row, candidates) {
        for (const c of candidates) {
            if (c in row && row[c] !== '')
                return row[c];
            const snake = c.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (snake in row && row[snake] !== '')
                return row[snake];
        }
        return undefined;
    }
    collectDerivedCodes(row, codes) {
        const oc = this.resolveColumn(row, ['ownership_code', 'ownership_id', 'ownership']);
        if (oc)
            codes.ownershipCodes.add(oc);
        const otc = this.resolveColumn(row, ['ownership_type_code', 'ownership_type_id']);
        if (otc)
            codes.ownershipTypeCodes.add(otc);
        const os = this.resolveColumn(row, ['operational_status_id', 'operational_status_code']);
        if (os)
            codes.operationalStatusIds.add(os);
        const rs = this.resolveColumn(row, ['registration_status_code', 'registration_status_id']);
        if (rs)
            codes.registrationStatusCodes.add(rs);
        const ls = this.resolveColumn(row, ['license_status_code', 'license_status_id']);
        if (ls)
            codes.licenseStatusCodes.add(ls);
    }
    async importReferenceData(refData, stats) {
        const configs = [
            { sheetName: 'state', repo: this.stateRepository, ctor: state_entity_1.StateEntity, statKey: 'statesCreated' },
            { sheetName: 'lga', repo: this.lgaRepository, ctor: lga_entity_1.LgaEntity, statKey: 'lgasCreated' },
            { sheetName: 'ward', repo: this.wardRepository, ctor: ward_entity_1.WardEntity, statKey: 'wardsCreated' },
            { sheetName: 'facility_type', repo: this.facilityTypeRepository, ctor: facility_type_entity_1.FacilityTypeEntity, statKey: 'facilityTypesCreated' },
            { sheetName: 'facility_level', repo: this.facilityLevelRepository, ctor: facility_level_entity_1.FacilityLevelEntity, statKey: 'facilityLevelsCreated' },
        ];
        for (const { sheetName, repo, statKey } of configs) {
            const data = refData[sheetName];
            if (!data)
                continue;
            for (const row of data.rows) {
                const code = row.code?.trim();
                const name = row.name?.trim();
                if (!code)
                    continue;
                try {
                    const existing = await repo.findOne({ where: { code } });
                    if (existing) {
                        if (name && existing.name !== name) {
                            existing.name = name;
                            await repo.save(existing);
                        }
                    }
                    else {
                        await repo.save(repo.create({ code, name: name || code }));
                        stats[statKey]++;
                    }
                }
                catch (err) {
                    stats.errors.push(`Failed to import ${sheetName} code=${code}: ${err.message}`);
                }
            }
        }
    }
    async importDerivedCodes(codes, stats) {
        const sets = [
            [codes.ownershipCodes, concept_enum_1.CodingConcept.OWNERSHIP_TYPE],
            [codes.ownershipTypeCodes, concept_enum_1.CodingConcept.OWNERSHIP_TYPE],
            [codes.operationalStatusIds, concept_enum_1.CodingConcept.OPERATIONAL_STATUS],
            [codes.registrationStatusCodes, concept_enum_1.CodingConcept.REGISTRATION_STATUS],
            [codes.licenseStatusCodes, concept_enum_1.CodingConcept.LICENSE_STATUS],
        ];
        for (const [codeSet, concept] of sets) {
            for (const code of codeSet) {
                try {
                    const existing = await this.conceptCodeRepository.findOne({
                        where: { concept, code },
                    });
                    if (!existing) {
                        await this.conceptCodeRepository.save(this.conceptCodeRepository.create({ concept, code, name: code }));
                        stats.derivedCodesCreated++;
                    }
                }
                catch (err) {
                    stats.errors.push(`Failed to import derived ${concept} code=${code}: ${err.message}`);
                }
            }
        }
    }
    async ensureHierarchyAttributes() {
        const attrDefs = [
            { concept: concept_enum_1.CodingConcept.LGA, code: 'state_code', name: 'State Code' },
            { concept: concept_enum_1.CodingConcept.WARD, code: 'state_code', name: 'State Code' },
            { concept: concept_enum_1.CodingConcept.WARD, code: 'lga_code', name: 'LGA Code' },
        ];
        for (const def of attrDefs) {
            const existing = await this.attributeRepository.findOne({
                where: { concept: def.concept, code: def.code },
            });
            if (!existing) {
                await this.attributeRepository.save(this.attributeRepository.create({
                    concept: def.concept,
                    code: def.code,
                    name: def.name,
                    dataType: 'string',
                }));
            }
        }
    }
    async buildLookupMaps() {
        const maps = {};
        const entityConfigs = [
            { key: concept_enum_1.CodingConcept.STATE, repo: this.stateRepository },
            { key: concept_enum_1.CodingConcept.LGA, repo: this.lgaRepository },
            { key: concept_enum_1.CodingConcept.WARD, repo: this.wardRepository },
            { key: concept_enum_1.CodingConcept.FACILITY_TYPE, repo: this.facilityTypeRepository },
            { key: concept_enum_1.CodingConcept.FACILITY_LEVEL, repo: this.facilityLevelRepository },
        ];
        for (const { key, repo } of entityConfigs) {
            const map = new Map();
            const rows = await repo.find({ select: ['id', 'code'] });
            for (const r of rows) {
                if (r.code)
                    map.set(r.code, r.id);
            }
            maps[key] = map;
        }
        const conceptTypes = [
            concept_enum_1.CodingConcept.OWNERSHIP_TYPE,
            concept_enum_1.CodingConcept.OPERATIONAL_STATUS,
            concept_enum_1.CodingConcept.REGISTRATION_STATUS,
            concept_enum_1.CodingConcept.LICENSE_STATUS,
        ];
        for (const concept of conceptTypes) {
            const map = new Map();
            const rows = await this.conceptCodeRepository.find({
                where: { concept },
                select: ['id', 'code'],
            });
            for (const r of rows) {
                if (r.code)
                    map.set(r.code, r.id);
            }
            maps[concept] = map;
        }
        return maps;
    }
    resolveFacilityId(row) {
        const candidates = ['unique_id', 'uuid', 'id', 'facility_id', 'registration_no'];
        for (const c of candidates) {
            const val = this.resolveColumn(row, [c]);
            if (val)
                return { id: val, stable: true };
        }
        return { id: (0, crypto_1.randomUUID)(), stable: false };
    }
    async upsertFacility(row, lookupMaps, stats) {
        const { id: facilityId, stable } = this.resolveFacilityId(row);
        const uniqueId = this.resolveColumn(row, ['unique_id']);
        const registrationNo = this.resolveColumn(row, ['registration_no']);
        const facilityName = this.resolveColumn(row, ['facility_name', 'name']);
        if (!facilityName)
            return null;
        const alternativeName = this.resolveColumn(row, ['alt_facility_name']);
        const stateCode = this.resolveColumn(row, ['state_code', 'state_id', 'state']);
        const lgaCode = this.resolveColumn(row, ['lga_code', 'lga_id']);
        const wardCode = this.resolveColumn(row, ['ward_code', 'ward_id']);
        const facilityTypeCode = this.resolveColumn(row, ['facility_type_id', 'facility_type_code']);
        const facilityLevelCode = this.resolveColumn(row, ['facility_level_code', 'facility_level_id', 'facility_level_option_code', 'facility_level_option_id']);
        const stateId = stateCode ? lookupMaps[concept_enum_1.CodingConcept.STATE]?.get(stateCode) : undefined;
        const lgaId = lgaCode ? lookupMaps[concept_enum_1.CodingConcept.LGA]?.get(lgaCode) : undefined;
        const wardId = wardCode ? lookupMaps[concept_enum_1.CodingConcept.WARD]?.get(wardCode) : undefined;
        const facilityTypeId = facilityTypeCode ? lookupMaps[concept_enum_1.CodingConcept.FACILITY_TYPE]?.get(facilityTypeCode) : undefined;
        const facilityLevelId = facilityLevelCode ? lookupMaps[concept_enum_1.CodingConcept.FACILITY_LEVEL]?.get(facilityLevelCode) : undefined;
        const ownershipCode = this.resolveColumn(row, ['ownership_code', 'ownership_id', 'ownership']);
        const ownershipTypeCode = this.resolveColumn(row, ['ownership_type_code', 'ownership_type_id']);
        const operationalStatusCode = this.resolveColumn(row, ['operational_status_id', 'operational_status_code']);
        const registrationStatusCode = this.resolveColumn(row, ['registration_status_code', 'registration_status_id']);
        const licenseStatusCode = this.resolveColumn(row, ['license_status_code', 'license_status_id']);
        const latitude = parseFloat(this.resolveColumn(row, ['latitude']) || '');
        const longitude = parseFloat(this.resolveColumn(row, ['longitude']) || '');
        const phoneNumber = this.resolveColumn(row, ['phone_number']);
        const alternateNumber = this.resolveColumn(row, ['alternate_number']);
        const emailAddress = this.resolveColumn(row, ['email_address']);
        const website = this.resolveColumn(row, ['website']);
        const outpatient = this.resolveColumn(row, ['outpatient']) === '1' || this.resolveColumn(row, ['outpatient']) === 'true' || this.resolveColumn(row, ['outpatient']) === 'yes';
        const inpatient = this.resolveColumn(row, ['inpatient']) === '1' || this.resolveColumn(row, ['inpatient']) === 'true' || this.resolveColumn(row, ['inpatient']) === 'yes';
        let facility = null;
        if (stable) {
            facility = await this.facilityRepository.findOne({ where: { facilityId } });
        }
        else {
            const matchState = stateId ? { id: stateId } : undefined;
            const matchLga = lgaId ? { id: lgaId } : undefined;
            const matchWard = wardId ? { id: wardId } : undefined;
            facility = await this.facilityRepository.findOne({
                where: { facilityName, state: matchState, lga: matchLga },
            });
            if (!facility && wardId) {
                facility = await this.facilityRepository.findOne({
                    where: { facilityName, state: matchState, ward: matchWard },
                });
            }
        }
        const facilityData = {
            facilityId,
            uniqueId: uniqueId || null,
            registrationNo: registrationNo || null,
            facilityName,
            alternativeName: alternativeName || null,
            state: stateId || null,
            lga: lgaId || null,
            ward: wardId || null,
            facilityType: facilityTypeId || null,
            facilityLevel: facilityLevelId || null,
            ownershipCode: ownershipCode || null,
            ownershipTypeCode: ownershipTypeCode || null,
            operationalStatusCode: operationalStatusCode || null,
            registrationStatusCode: registrationStatusCode || null,
            licenseStatusCode: licenseStatusCode || null,
            latitude: isNaN(latitude) ? undefined : latitude,
            longitude: isNaN(longitude) ? undefined : longitude,
            phoneNumber: phoneNumber || null,
            alternateNumber: alternateNumber || null,
            emailAddress: emailAddress || null,
            website: website || null,
            outpatient,
            inpatient,
        };
        if (facility) {
            await this.facilityRepository.update(facility.id, facilityData);
            stats.facilitiesUpdated++;
        }
        else {
            facility = this.facilityRepository.create(facilityData);
            await this.facilityRepository.save(facility);
            stats.facilitiesCreated++;
        }
        for (const [key, value] of Object.entries(row)) {
            const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
            if (!FACILITY_ATTRIBUTE_FIELDS.has(normalizedKey))
                continue;
            if (!value || value.trim() === '')
                continue;
            const existingAttr = await this.facilityAttributeRepository.findOne({
                where: {
                    facility: { id: facility.id },
                    attributeCode: normalizedKey,
                },
            });
            if (existingAttr) {
                if (existingAttr.value !== value) {
                    existingAttr.value = value;
                    await this.facilityAttributeRepository.save(existingAttr);
                }
            }
            else {
                await this.facilityAttributeRepository.save(this.facilityAttributeRepository.create({
                    facility,
                    attributeCode: normalizedKey,
                    value,
                }));
                stats.facilityAttributesCreated++;
            }
        }
        return facility;
    }
};
exports.FacilitySeederService = FacilitySeederService;
exports.FacilitySeederService = FacilitySeederService = FacilitySeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ConceptCodingEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.ConceptAttributeValueEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(facility_entity_1.FacilityEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(facility_attribute_entity_1.FacilityAttributeEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(state_entity_1.StateEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(lga_entity_1.LgaEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(ward_entity_1.WardEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(facility_type_entity_1.FacilityTypeEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(facility_level_entity_1.FacilityLevelEntity)),
    __metadata("design:paramtypes", [facility_sheets_service_1.FacilitySheetsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FacilitySeederService);
//# sourceMappingURL=facility.seeder.js.map