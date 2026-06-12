import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CodingConcept } from '../../../common/enums/concept.enum';
import { FacilitySheetsService, SheetData, SheetSyncUpdate } from '../../../common/services/facility-sheets.service';
import {
  ConceptCodingEntity,
  ConceptAttributeEntity,
  ConceptAttributeValueEntity,
} from '../../concepts/entities';
import { FacilityEntity } from '../entities/facility.entity';
import { FacilityAttributeEntity } from '../entities/facility-attribute.entity';
import { StateEntity } from '../entities/state.entity';
import { LgaEntity } from '../entities/lga.entity';
import { WardEntity } from '../entities/ward.entity';
import { FacilityTypeEntity } from '../entities/facility-type.entity';
import { FacilityLevelEntity } from '../entities/facility-level.entity';

export interface FacilitySeederResult {
  success: boolean;
  message: string;
  stats: {
    statesCreated: number;
    lgasCreated: number;
    wardsCreated: number;
    facilityTypesCreated: number;
    facilityLevelsCreated: number;
    derivedCodesCreated: number;
    facilitiesCreated: number;
    facilitiesUpdated: number;
    facilityAttributesCreated: number;
    errors: string[];
  };
}

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

@Injectable()
export class FacilitySeederService {
  private readonly logger = new Logger(FacilitySeederService.name);

  constructor(
    private facilitySheetsService: FacilitySheetsService,
    @InjectRepository(ConceptCodingEntity)
    private conceptCodeRepository: Repository<ConceptCodingEntity>,
    @InjectRepository(ConceptAttributeEntity)
    private attributeRepository: Repository<ConceptAttributeEntity>,
    @InjectRepository(ConceptAttributeValueEntity)
    private valueRepository: Repository<ConceptAttributeValueEntity>,
    @InjectRepository(FacilityEntity)
    private facilityRepository: Repository<FacilityEntity>,
    @InjectRepository(FacilityAttributeEntity)
    private facilityAttributeRepository: Repository<FacilityAttributeEntity>,
    @InjectRepository(StateEntity)
    private stateRepository: Repository<StateEntity>,
    @InjectRepository(LgaEntity)
    private lgaRepository: Repository<LgaEntity>,
    @InjectRepository(WardEntity)
    private wardRepository: Repository<WardEntity>,
    @InjectRepository(FacilityTypeEntity)
    private facilityTypeRepository: Repository<FacilityTypeEntity>,
    @InjectRepository(FacilityLevelEntity)
    private facilityLevelRepository: Repository<FacilityLevelEntity>,
  ) {}

  async seedFacilities(): Promise<FacilitySeederResult> {
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
      errors: [] as string[],
    };

    try {
      this.logger.log('Starting facility data import...');

      const sheetNames = await this.facilitySheetsService.getSheetNames();
      this.logger.log(`Found ${sheetNames.length} sheets`);

      const refSheets = ['state', 'lga', 'ward', 'facility_type', 'facility_level'];
      const refData: Record<string, SheetData> = {};

      for (const name of refSheets) {
        if (sheetNames.includes(name)) {
          refData[name] = await this.facilitySheetsService.fetchSheetData(name);
          this.logger.log(`Loaded ${name}: ${refData[name].rows.length} rows`);
        }
      }

      const facilitySheetNames = sheetNames.filter(n => n.startsWith('facility_'));
      this.logger.log(`Found ${facilitySheetNames.length} facility sheets`);

      const allDerivedCodes = {
        ownershipCodes: new Set<string>(),
        ownershipTypeCodes: new Set<string>(),
        operationalStatusIds: new Set<string>(),
        registrationStatusCodes: new Set<string>(),
        licenseStatusCodes: new Set<string>(),
      };

      for (const sheetName of facilitySheetNames) {
        const data = await this.facilitySheetsService.fetchSheetData(sheetName);
        for (const row of data.rows) {
          this.collectDerivedCodes(row, allDerivedCodes);
        }
      }

      // Import reference data into concrete entity tables
      await this.importReferenceData(refData, stats);

      // Import derived codes into ConceptCodingEntity (unchanged)
      await this.importDerivedCodes(allDerivedCodes, stats);

      // Ensure hierarchy attributes (unchanged)
      await this.ensureHierarchyAttributes();

      // Build lookup maps from concrete entities
      const lookupMaps = await this.buildLookupMaps();

      // Import facilities
      for (const sheetName of facilitySheetNames) {
        const data = await this.facilitySheetsService.fetchSheetData(sheetName);
        this.logger.log(`Processing ${sheetName}: ${data.rows.length} rows`);

        const syncUpdates: SheetSyncUpdate[] = [];

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
          } catch (err: any) {
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
          } catch (err: any) {
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
    } catch (err: any) {
      this.logger.error(`Facility import failed: ${err.message}`, err.stack);
      stats.errors.push(err.message);
      return { success: false, message: `Import failed: ${err.message}`, stats };
    }
  }

  private resolveColumn(row: Record<string, string>, candidates: string[]): string | undefined {
    for (const c of candidates) {
      if (c in row && row[c] !== '') return row[c];
      const snake = c.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snake in row && row[snake] !== '') return row[snake];
    }
    return undefined;
  }

  private collectDerivedCodes(
    row: Record<string, string>,
    codes: {
      ownershipCodes: Set<string>;
      ownershipTypeCodes: Set<string>;
      operationalStatusIds: Set<string>;
      registrationStatusCodes: Set<string>;
      licenseStatusCodes: Set<string>;
    },
  ): void {
    const oc = this.resolveColumn(row, ['ownership_code', 'ownership_id', 'ownership']);
    if (oc) codes.ownershipCodes.add(oc);
    const otc = this.resolveColumn(row, ['ownership_type_code', 'ownership_type_id']);
    if (otc) codes.ownershipTypeCodes.add(otc);
    const os = this.resolveColumn(row, ['operational_status_id', 'operational_status_code']);
    if (os) codes.operationalStatusIds.add(os);
    const rs = this.resolveColumn(row, ['registration_status_code', 'registration_status_id']);
    if (rs) codes.registrationStatusCodes.add(rs);
    const ls = this.resolveColumn(row, ['license_status_code', 'license_status_id']);
    if (ls) codes.licenseStatusCodes.add(ls);
  }

  private async importReferenceData(
    refData: Record<string, SheetData>,
    stats: FacilitySeederResult['stats'],
  ): Promise<void> {
    type EntityRepo = Repository<any>;
    type EntityCtor = new (...args: any[]) => any;

    const configs: { sheetName: string; repo: EntityRepo; ctor: EntityCtor; statKey: keyof FacilitySeederResult['stats'] }[] = [
      { sheetName: 'state', repo: this.stateRepository, ctor: StateEntity, statKey: 'statesCreated' },
      { sheetName: 'lga', repo: this.lgaRepository, ctor: LgaEntity, statKey: 'lgasCreated' },
      { sheetName: 'ward', repo: this.wardRepository, ctor: WardEntity, statKey: 'wardsCreated' },
      { sheetName: 'facility_type', repo: this.facilityTypeRepository, ctor: FacilityTypeEntity, statKey: 'facilityTypesCreated' },
      { sheetName: 'facility_level', repo: this.facilityLevelRepository, ctor: FacilityLevelEntity, statKey: 'facilityLevelsCreated' },
    ];

    for (const { sheetName, repo, statKey } of configs) {
      const data = refData[sheetName];
      if (!data) continue;

      for (const row of data.rows) {
        const code = row.code?.trim();
        const name = row.name?.trim();
        if (!code) continue;

        try {
          const existing = await repo.findOne({ where: { code } });
          if (existing) {
            if (name && existing.name !== name) {
              existing.name = name;
              await repo.save(existing);
            }
          } else {
            await repo.save(repo.create({ code, name: name || code }));
            stats[statKey]++;
          }
        } catch (err: any) {
          stats.errors.push(`Failed to import ${sheetName} code=${code}: ${err.message}`);
        }
      }
    }
  }

  private async importDerivedCodes(
    codes: {
      ownershipCodes: Set<string>;
      ownershipTypeCodes: Set<string>;
      operationalStatusIds: Set<string>;
      registrationStatusCodes: Set<string>;
      licenseStatusCodes: Set<string>;
    },
    stats: FacilitySeederResult['stats'],
  ): Promise<void> {
    const sets: [Set<string>, CodingConcept][] = [
      [codes.ownershipCodes, CodingConcept.OWNERSHIP_TYPE],
      [codes.ownershipTypeCodes, CodingConcept.OWNERSHIP_TYPE],
      [codes.operationalStatusIds, CodingConcept.OPERATIONAL_STATUS],
      [codes.registrationStatusCodes, CodingConcept.REGISTRATION_STATUS],
      [codes.licenseStatusCodes, CodingConcept.LICENSE_STATUS],
    ];

    for (const [codeSet, concept] of sets) {
      for (const code of codeSet) {
        try {
          const existing = await this.conceptCodeRepository.findOne({
            where: { concept, code },
          });
          if (!existing) {
            await this.conceptCodeRepository.save(
              this.conceptCodeRepository.create({ concept, code, name: code }),
            );
            stats.derivedCodesCreated++;
          }
        } catch (err: any) {
          stats.errors.push(`Failed to import derived ${concept} code=${code}: ${err.message}`);
        }
      }
    }
  }

  private async ensureHierarchyAttributes(): Promise<void> {
    const attrDefs: { concept: CodingConcept; code: string; name: string }[] = [
      { concept: CodingConcept.LGA, code: 'state_code', name: 'State Code' },
      { concept: CodingConcept.WARD, code: 'state_code', name: 'State Code' },
      { concept: CodingConcept.WARD, code: 'lga_code', name: 'LGA Code' },
    ];

    for (const def of attrDefs) {
      const existing = await this.attributeRepository.findOne({
        where: { concept: def.concept, code: def.code },
      });
      if (!existing) {
        await this.attributeRepository.save(
          this.attributeRepository.create({
            concept: def.concept,
            code: def.code,
            name: def.name,
            dataType: 'string',
          }),
        );
      }
    }
  }

  private async buildLookupMaps(): Promise<Record<string, Map<string, string>>> {
    const maps: Record<string, Map<string, string>> = {};

    // Concrete entity lookups
    const entityConfigs: { key: string; repo: Repository<any> }[] = [
      { key: CodingConcept.STATE, repo: this.stateRepository },
      { key: CodingConcept.LGA, repo: this.lgaRepository },
      { key: CodingConcept.WARD, repo: this.wardRepository },
      { key: CodingConcept.FACILITY_TYPE, repo: this.facilityTypeRepository },
      { key: CodingConcept.FACILITY_LEVEL, repo: this.facilityLevelRepository },
    ];

    for (const { key, repo } of entityConfigs) {
      const map = new Map<string, string>();
      const rows = await repo.find({ select: ['id', 'code'] });
      for (const r of rows) {
        if (r.code) map.set(r.code, r.id);
      }
      maps[key] = map;
    }

    // ConceptCodingEntity lookups for derived codes
    const conceptTypes = [
      CodingConcept.OWNERSHIP_TYPE,
      CodingConcept.OPERATIONAL_STATUS,
      CodingConcept.REGISTRATION_STATUS,
      CodingConcept.LICENSE_STATUS,
    ];

    for (const concept of conceptTypes) {
      const map = new Map<string, string>();
      const rows = await this.conceptCodeRepository.find({
        where: { concept },
        select: ['id', 'code'],
      });
      for (const r of rows) {
        if (r.code) map.set(r.code, r.id);
      }
      maps[concept] = map;
    }

    return maps;
  }

  private resolveFacilityId(row: Record<string, string>): { id: string; stable: boolean } {
    const candidates = ['unique_id', 'uuid', 'id', 'facility_id', 'registration_no'];
    for (const c of candidates) {
      const val = this.resolveColumn(row, [c]);
      if (val) return { id: val, stable: true };
    }
    return { id: randomUUID(), stable: false };
  }

  private async upsertFacility(
    row: Record<string, string>,
    lookupMaps: Record<string, Map<string, string>>,
    stats: FacilitySeederResult['stats'],
  ): Promise<FacilityEntity | null> {
    const { id: facilityId, stable } = this.resolveFacilityId(row);

    const uniqueId = this.resolveColumn(row, ['unique_id']);
    const registrationNo = this.resolveColumn(row, ['registration_no']);
    const facilityName = this.resolveColumn(row, ['facility_name', 'name']);
    if (!facilityName) return null;

    const alternativeName = this.resolveColumn(row, ['alt_facility_name']);

    // Resolve codes from sheet then look up concrete entity UUIDs
    const stateCode = this.resolveColumn(row, ['state_code', 'state_id', 'state']);
    const lgaCode = this.resolveColumn(row, ['lga_code', 'lga_id']);
    const wardCode = this.resolveColumn(row, ['ward_code', 'ward_id']);
    const facilityTypeCode = this.resolveColumn(row, ['facility_type_id', 'facility_type_code']);
    const facilityLevelCode = this.resolveColumn(row, ['facility_level_code', 'facility_level_id', 'facility_level_option_code', 'facility_level_option_id']);

    const stateId = stateCode ? lookupMaps[CodingConcept.STATE]?.get(stateCode) : undefined;
    const lgaId = lgaCode ? lookupMaps[CodingConcept.LGA]?.get(lgaCode) : undefined;
    const wardId = wardCode ? lookupMaps[CodingConcept.WARD]?.get(wardCode) : undefined;
    const facilityTypeId = facilityTypeCode ? lookupMaps[CodingConcept.FACILITY_TYPE]?.get(facilityTypeCode) : undefined;
    const facilityLevelId = facilityLevelCode ? lookupMaps[CodingConcept.FACILITY_LEVEL]?.get(facilityLevelCode) : undefined;

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

    // Upsert facility
    let facility: FacilityEntity | null = null;
    if (stable) {
      facility = await this.facilityRepository.findOne({ where: { facilityId } });
    } else {
      const matchState = stateId ? { id: stateId } : undefined;
      const matchLga = lgaId ? { id: lgaId } : undefined;
      const matchWard = wardId ? { id: wardId } : undefined;
      facility = await this.facilityRepository.findOne({
        where: { facilityName, state: matchState as any, lga: matchLga as any },
      });
      if (!facility && wardId) {
        facility = await this.facilityRepository.findOne({
          where: { facilityName, state: matchState as any, ward: matchWard as any },
        });
      }
    }

    const facilityData: Record<string, any> = {
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
    } else {
      facility = this.facilityRepository.create(facilityData);
      await this.facilityRepository.save(facility);
      stats.facilitiesCreated++;
    }

    // Upsert facility attributes for non-core fields
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
      if (!FACILITY_ATTRIBUTE_FIELDS.has(normalizedKey)) continue;
      if (!value || value.trim() === '') continue;

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
      } else {
        await this.facilityAttributeRepository.save(
          this.facilityAttributeRepository.create({
            facility,
            attributeCode: normalizedKey,
            value,
          }),
        );
        stats.facilityAttributesCreated++;
      }
    }

    return facility;
  }
}
