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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WardCodingEntity = exports.LgaCodingEntity = exports.StateCodingEntity = void 0;
const typeorm_1 = require("typeorm");
const concept_enum_1 = require("../../../common/enums/concept.enum");
const concept_coding_entity_1 = require("./concept-coding.entity");
let StateCodingEntity = class StateCodingEntity extends concept_coding_entity_1.ConceptCodingEntity {
    constructor() {
        super();
        this.concept = concept_enum_1.CodingConcept.STATE;
    }
};
exports.StateCodingEntity = StateCodingEntity;
exports.StateCodingEntity = StateCodingEntity = __decorate([
    (0, typeorm_1.Entity)('admin_states'),
    (0, typeorm_1.Index)(['concept', 'code']),
    __metadata("design:paramtypes", [])
], StateCodingEntity);
let LgaCodingEntity = class LgaCodingEntity extends concept_coding_entity_1.ConceptCodingEntity {
    constructor() {
        super();
        this.concept = concept_enum_1.CodingConcept.LGA;
    }
};
exports.LgaCodingEntity = LgaCodingEntity;
exports.LgaCodingEntity = LgaCodingEntity = __decorate([
    (0, typeorm_1.Entity)('admin_lgas'),
    (0, typeorm_1.Index)(['concept', 'code']),
    __metadata("design:paramtypes", [])
], LgaCodingEntity);
let WardCodingEntity = class WardCodingEntity extends concept_coding_entity_1.ConceptCodingEntity {
    constructor() {
        super();
        this.concept = concept_enum_1.CodingConcept.WARD;
    }
};
exports.WardCodingEntity = WardCodingEntity;
exports.WardCodingEntity = WardCodingEntity = __decorate([
    (0, typeorm_1.Entity)('admin_wards'),
    (0, typeorm_1.Index)(['concept', 'code']),
    __metadata("design:paramtypes", [])
], WardCodingEntity);
//# sourceMappingURL=admin-level.entity.js.map