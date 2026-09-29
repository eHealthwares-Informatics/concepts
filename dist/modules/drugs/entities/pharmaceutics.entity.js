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
exports.PharmaceuticsEntity = void 0;
const typeorm_1 = require("typeorm");
const generic_product_entity_1 = require("./generic-product.entity");
const drug_component_entity_1 = require("./drug-component.entity");
let PharmaceuticsEntity = class PharmaceuticsEntity {
    id;
    code;
    clinicalName;
    brandNames;
    drugClass;
    bodySystem;
    formulations;
    chemicalConstituents;
    pharmacology;
    commonGenericName;
    indications;
    contraindications;
    precautions;
    warnings;
    mechanismOfAction;
    adverseEffects;
    drugInteractions;
    ivIncompatibilities;
    foodInteractions;
    traditionalMedicineEffects;
    dosage;
    dosePerAgeRange;
    dosePerWeightRange;
    missedDose;
    bodyWeightAndAge;
    physiologicalVariables;
    pharmacokineticVariables;
    diseaseVariables;
    environmentalVariables;
    extremesOfAge;
    intercurrentIllness;
    adherenceInfo;
    prescriptionReasons;
    recommendations;
    generalDrugUse;
    patientCounseling;
    nursingConsiderations;
    recommendedLabel;
    isControlledSubstance;
    pregnancyEffects;
    breastfeedingEffects;
    interactiveEffects;
    renalImpairment;
    hepaticImpairment;
    atcCode;
    ndfGenericCode;
    ndfPharmaceuticsCode;
    genericProducts;
    drugComponents;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.PharmaceuticsEntity = PharmaceuticsEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PharmaceuticsEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PharmaceuticsEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clinical_name', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "clinicalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_names', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "brandNames", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drug_class', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "drugClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'body_system', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "bodySystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "formulations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chemical_constituents', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "chemicalConstituents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "pharmacology", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'common_generic_name', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "commonGenericName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "indications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "contraindications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "precautions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "warnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mechanism_of_action', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "mechanismOfAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "adverseEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drug_interactions', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "drugInteractions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'iv_incompatibilities', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "ivIncompatibilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'food_interactions', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "foodInteractions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'traditional_medicine_effects', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "traditionalMedicineEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dosage', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dose_per_age_range', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "dosePerAgeRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dose_per_weight_range', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "dosePerWeightRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'missed_dose', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "missedDose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'body_weight_and_age', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "bodyWeightAndAge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'physiological_variables', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "physiologicalVariables", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pharmacokinetic_variables', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "pharmacokineticVariables", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disease_variables', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "diseaseVariables", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'environmental_variables', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "environmentalVariables", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extremes_of_age', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "extremesOfAge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intercurrent_illness', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "intercurrentIllness", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adherence_info', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "adherenceInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prescription_reasons', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "prescriptionReasons", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommendations', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'general_drug_use', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "generalDrugUse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_counseling', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "patientCounseling", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nursing_considerations', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "nursingConsiderations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommended_label', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "recommendedLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_controlled_substance', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PharmaceuticsEntity.prototype, "isControlledSubstance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pregnancy_effects', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "pregnancyEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'breastfeeding_effects', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "breastfeedingEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interactive_effects', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "interactiveEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renal_impairment', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "renalImpairment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hepatic_impairment', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "hepaticImpairment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'atc_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "atcCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ndf_generic_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "ndfGenericCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ndf_pharmaceutics_code', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "ndfPharmaceuticsCode", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => generic_product_entity_1.GenericProductEntity, (gp) => gp.pharmaceutics),
    __metadata("design:type", Array)
], PharmaceuticsEntity.prototype, "genericProducts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => drug_component_entity_1.DrugComponentEntity, (dc) => dc.pharmaceutics),
    (0, typeorm_1.JoinTable)({
        name: 'pharmaceutics_drug_components',
        joinColumn: { name: 'pharmaceutics_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'drug_component_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], PharmaceuticsEntity.prototype, "drugComponents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PharmaceuticsEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PharmaceuticsEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], PharmaceuticsEntity.prototype, "deletedAt", void 0);
exports.PharmaceuticsEntity = PharmaceuticsEntity = __decorate([
    (0, typeorm_1.Entity)('pharmaceutics')
], PharmaceuticsEntity);
//# sourceMappingURL=pharmaceutics.entity.js.map