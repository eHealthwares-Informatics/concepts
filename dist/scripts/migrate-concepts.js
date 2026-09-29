"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const entities_1 = require("../modules/concepts/entities");
const concept_enum_1 = require("../common/enums/concept.enum");
const entities_2 = require("../modules/facilities/entities");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadEnv() {
    const envPath = path.resolve(__dirname, '../../.env');
    if (!fs.existsSync(envPath))
        return;
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1)
            continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
}
async function migrate() {
    loadEnv();
    const dbType = (process.env.DB_TYPE || 'sqlite');
    const ds = new typeorm_1.DataSource({
        type: dbType,
        database: process.env.DB_NAME || 'coding-concepts.sqlite',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        entities: [
            entities_1.ConceptCodingEntity,
            entities_1.ConceptAttributeEntity,
            entities_1.ConceptAttributeValueEntity,
            entities_1.ExternalConceptMappingEntity,
            entities_1.ImportTrackingEntity,
            entities_2.FacilityEntity,
            entities_2.StateEntity,
            entities_2.LgaEntity,
            entities_2.WardEntity,
            entities_2.FacilityTypeEntity,
            entities_2.FacilityLevelEntity,
        ],
        synchronize: false,
    });
    await ds.initialize();
    console.log('Connected to database');
    const conceptCodeRepo = ds.getRepository(entities_1.ConceptCodingEntity);
    const facilityRepo = ds.getRepository(entities_2.FacilityEntity);
    const migrationMap = [
        { concept: concept_enum_1.CodingConcept.STATE, repo: ds.getRepository(entities_2.StateEntity) },
        { concept: concept_enum_1.CodingConcept.LGA, repo: ds.getRepository(entities_2.LgaEntity) },
        { concept: concept_enum_1.CodingConcept.WARD, repo: ds.getRepository(entities_2.WardEntity) },
        { concept: concept_enum_1.CodingConcept.FACILITY_TYPE, repo: ds.getRepository(entities_2.FacilityTypeEntity) },
        { concept: concept_enum_1.CodingConcept.FACILITY_LEVEL, repo: ds.getRepository(entities_2.FacilityLevelEntity) },
    ];
    for (const { concept, repo } of migrationMap) {
        const rows = await conceptCodeRepo.find({
            where: { concept },
            select: ['code', 'name'],
        });
        if (!rows.length) {
            console.log(`${concept}: 0 rows (skipping)`);
            continue;
        }
        let inserted = 0;
        for (const row of rows) {
            if (!row.code)
                continue;
            const existing = await repo.findOne({ where: { code: row.code } });
            if (!existing) {
                await repo.save(repo.create({ code: row.code, name: row.name || '' }));
                inserted++;
            }
        }
        console.log(`${concept}: ${inserted} new, ${rows.length} total`);
    }
    const totalFacilities = await facilityRepo.count();
    console.log(`\nFacilities: ${totalFacilities} total`);
    console.log('NOTE: Old stateCode/lgaCode/wardCode columns were dropped during schema sync.');
    console.log('Facility FK values cannot be recovered from ConceptCodingEntity alone.');
    console.log('To populate facility FKs, re-run the seeder:');
    console.log('  npm run seed:facility\n');
    await ds.destroy();
    console.log('Migration complete');
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-concepts.js.map