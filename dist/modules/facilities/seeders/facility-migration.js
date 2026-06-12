"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const concept_coding_entity_1 = require("../../concepts/entities/concept-coding.entity");
const facility_entity_1 = require("../entities/facility.entity");
const state_entity_1 = require("../entities/state.entity");
const lga_entity_1 = require("../entities/lga.entity");
const ward_entity_1 = require("../entities/ward.entity");
const facility_type_entity_1 = require("../entities/facility-type.entity");
const facility_level_entity_1 = require("../entities/facility-level.entity");
const concept_enum_1 = require("../../../common/enums/concept.enum");
async function migrate() {
    const ds = new typeorm_1.DataSource({
        type: 'sqlite',
        database: 'coding-concepts.sqlite',
        entities: [
            concept_coding_entity_1.ConceptCodingEntity,
            facility_entity_1.FacilityEntity,
            state_entity_1.StateEntity,
            lga_entity_1.LgaEntity,
            ward_entity_1.WardEntity,
            facility_type_entity_1.FacilityTypeEntity,
            facility_level_entity_1.FacilityLevelEntity,
        ],
        synchronize: false,
    });
    await ds.initialize();
    console.log('Connected to database');
    const conceptCodeRepo = ds.getRepository(concept_coding_entity_1.ConceptCodingEntity);
    const stateRepo = ds.getRepository(state_entity_1.StateEntity);
    const lgaRepo = ds.getRepository(lga_entity_1.LgaEntity);
    const wardRepo = ds.getRepository(ward_entity_1.WardEntity);
    const facilityTypeRepo = ds.getRepository(facility_type_entity_1.FacilityTypeEntity);
    const facilityLevelRepo = ds.getRepository(facility_level_entity_1.FacilityLevelEntity);
    const facilityRepo = ds.getRepository(facility_entity_1.FacilityEntity);
    const concepts = await conceptCodeRepo.find({
        where: [
            { concept: concept_enum_1.CodingConcept.STATE },
            { concept: concept_enum_1.CodingConcept.LGA },
            { concept: concept_enum_1.CodingConcept.WARD },
            { concept: concept_enum_1.CodingConcept.FACILITY_TYPE },
            { concept: concept_enum_1.CodingConcept.FACILITY_LEVEL },
        ],
        select: ['id', 'concept', 'code', 'name'],
    });
    console.log(`Found ${concepts.length} concept codes to migrate`);
    const oldMap = {};
    for (const c of concepts) {
        if (!oldMap[c.concept])
            oldMap[c.concept] = new Map();
        if (c.code)
            oldMap[c.concept].set(c.code, { id: c.id, code: c.code, name: c.name || '' });
    }
    const newMap = {};
    const entityRepos = [
        { concept: concept_enum_1.CodingConcept.STATE, repo: stateRepo },
        { concept: concept_enum_1.CodingConcept.LGA, repo: lgaRepo },
        { concept: concept_enum_1.CodingConcept.WARD, repo: wardRepo },
        { concept: concept_enum_1.CodingConcept.FACILITY_TYPE, repo: facilityTypeRepo },
        { concept: concept_enum_1.CodingConcept.FACILITY_LEVEL, repo: facilityLevelRepo },
    ];
    for (const { concept, repo } of entityRepos) {
        const map = new Map();
        const oldEntries = oldMap[concept];
        if (!oldEntries) {
            console.log(`No ${concept} entries to migrate`);
            newMap[concept] = map;
            continue;
        }
        let inserted = 0;
        for (const entry of oldEntries.values()) {
            const existing = await repo.findOne({ where: { code: entry.code } });
            if (existing) {
                map.set(entry.code, existing.id);
            }
            else {
                const saved = await repo.save(repo.create({ code: entry.code, name: entry.name || '' }));
                map.set(entry.code, saved.id);
                inserted++;
            }
        }
        newMap[concept] = map;
        console.log(`Migrated ${inserted} new ${concept} entries (${oldEntries.size} total)`);
    }
    const facilities = await facilityRepo.find({
        select: ['id', 'stateId', 'lgaId', 'wardId'],
    });
    let hasOldFks = false;
    for (const f of facilities) {
        if (f.stateId || f.lgaId || f.wardId) {
            hasOldFks = true;
            break;
        }
    }
    if (!hasOldFks) {
        console.log('No old FK data found in facilities. Old columns were dropped by synchronize.');
        console.log('Facilities may need to be re-seeded from Google Sheets.');
        console.log('Attempting to populate FKs by matching codes from concept_codes...');
        const codeById = new Map();
        for (const c of concepts) {
            if (c.code)
                codeById.set(c.id, c.code);
        }
    }
    else {
        console.log(`Updating ${facilities.length} facilities with new FK UUIDs...`);
        let updated = 0;
        for (const f of facilities) {
            const updates = {};
            if (f.stateId) {
                const oldCode = oldMap[concept_enum_1.CodingConcept.STATE]?.get(f.stateId);
            }
        }
    }
    await ds.destroy();
    console.log('Migration complete');
}
migrate().catch(console.error);
//# sourceMappingURL=facility-migration.js.map