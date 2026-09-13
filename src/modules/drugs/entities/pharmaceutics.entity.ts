import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenericProductEntity } from './generic-product.entity';
import { DrugComponentEntity } from './drug-component.entity';

/**
 * Pharmaceutics entity — represents a drug monograph (pharmacological class level).
 *
 * Schema follows the Nigerian EMDEx formulary's 44-column structure.
 * Each row is identified by `code` (ATC code from EMDEx or PN-xxxxx from NDF).
 *
 * Relations:
 *   - One-to-Many → GenericProductEntity (multiple formulations per monograph)
 *   - Many-to-Many → DrugComponentEntity (active ingredients)
 */
@Entity('pharmaceutics')
export class PharmaceuticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ── Identity & classification ──────────────────────────────────────────

  /** ATC code (EMDEx) or PN-xxxxx (NDF). Business key for upserts. */
  @Column({ type: 'text' })
  code!: string;

  /** INN / generic name (EMDEx: drug_name). */
  @Column({ name: 'clinical_name', type: 'text', nullable: true })
  clinicalName!: string | null;

  /** Popular trade/brand names (EMDEx: popular_trade_names). */
  @Column({ name: 'brand_names', type: 'text', nullable: true })
  brandNames!: string | null;

  /** Therapeutic/pharmacological class (EMDEx: therapeutic_category). */
  @Column({ name: 'drug_class', type: 'text', nullable: true })
  drugClass!: string | null;

  /** Body system classification (EMDEx: body_system_cns_cvs_others). */
  @Column({ name: 'body_system', type: 'text', nullable: true })
  bodySystem!: string | null;

  /** Available formulations (EMDEx: drug_formulations). */
  @Column({ type: 'text', nullable: true })
  formulations!: string | null;

  /** Chemical constituents (from NDF/pharmaceutics.csv). */
  @Column({ name: 'chemical_constituents', type: 'text', nullable: true })
  chemicalConstituents!: string | null;

  /** Pharmacology description (from NDF/pharmaceutics.csv). */
  @Column({ type: 'text', nullable: true })
  pharmacology!: string | null;

  /** Common generic name (from genericDrugs.csv). */
  @Column({ name: 'common_generic_name', type: 'text', nullable: true })
  commonGenericName!: string | null;

  // ── Clinical monograph (EMDEx fields) ──────────────────────────────────

  @Column({ type: 'text', nullable: true })
  indications!: string | null;

  @Column({ type: 'text', nullable: true })
  contraindications!: string | null;

  @Column({ type: 'text', nullable: true })
  precautions!: string | null;

  @Column({ type: 'text', nullable: true })
  warnings!: string | null;

  @Column({ name: 'mechanism_of_action', type: 'text', nullable: true })
  mechanismOfAction!: string | null;

  @Column({ type: 'text', nullable: true })
  adverseEffects!: string | null;

  @Column({ name: 'drug_interactions', type: 'text', nullable: true })
  drugInteractions!: string | null;

  @Column({ name: 'iv_incompatibilities', type: 'text', nullable: true })
  ivIncompatibilities!: string | null;

  @Column({ name: 'food_interactions', type: 'text', nullable: true })
  foodInteractions!: string | null;

  @Column({ name: 'traditional_medicine_effects', type: 'text', nullable: true })
  traditionalMedicineEffects!: string | null;

  // ── Dosing ─────────────────────────────────────────────────────────────

  @Column({ name: 'dosage', type: 'text', nullable: true })
  dosage!: string | null;

  @Column({ name: 'dose_per_age_range', type: 'text', nullable: true })
  dosePerAgeRange!: string | null;

  @Column({ name: 'dose_per_weight_range', type: 'text', nullable: true })
  dosePerWeightRange!: string | null;

  @Column({ name: 'missed_dose', type: 'text', nullable: true })
  missedDose!: string | null;

  // ── Patient-specific variables ─────────────────────────────────────────

  @Column({ name: 'body_weight_and_age', type: 'text', nullable: true })
  bodyWeightAndAge!: string | null;

  @Column({ name: 'physiological_variables', type: 'text', nullable: true })
  physiologicalVariables!: string | null;

  @Column({ name: 'pharmacokinetic_variables', type: 'text', nullable: true })
  pharmacokineticVariables!: string | null;

  @Column({ name: 'disease_variables', type: 'text', nullable: true })
  diseaseVariables!: string | null;

  @Column({ name: 'environmental_variables', type: 'text', nullable: true })
  environmentalVariables!: string | null;

  @Column({ name: 'extremes_of_age', type: 'text', nullable: true })
  extremesOfAge!: string | null;

  @Column({ name: 'intercurrent_illness', type: 'text', nullable: true })
  intercurrentIllness!: string | null;

  // ── Adherence & prescribing ────────────────────────────────────────────

  @Column({ name: 'adherence_info', type: 'text', nullable: true })
  adherenceInfo!: string | null;

  @Column({ name: 'prescription_reasons', type: 'text', nullable: true })
  prescriptionReasons!: string | null;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations!: string | null;

  @Column({ name: 'general_drug_use', type: 'text', nullable: true })
  generalDrugUse!: string | null;

  @Column({ name: 'patient_counseling', type: 'text', nullable: true })
  patientCounseling!: string | null;

  @Column({ name: 'nursing_considerations', type: 'text', nullable: true })
  nursingConsiderations!: string | null;

  @Column({ name: 'recommended_label', type: 'text', nullable: true })
  recommendedLabel!: string | null;

  // ── Regulatory ─────────────────────────────────────────────────────────

  @Column({ name: 'is_controlled_substance', type: 'boolean', default: false })
  isControlledSubstance!: boolean;

  // ── Appendices ─────────────────────────────────────────────────────────

  @Column({ name: 'pregnancy_effects', type: 'text', nullable: true })
  pregnancyEffects!: string | null;

  @Column({ name: 'breastfeeding_effects', type: 'text', nullable: true })
  breastfeedingEffects!: string | null;

  @Column({ name: 'interactive_effects', type: 'text', nullable: true })
  interactiveEffects!: string | null;

  @Column({ name: 'renal_impairment', type: 'text', nullable: true })
  renalImpairment!: string | null;

  @Column({ name: 'hepatic_impairment', type: 'text', nullable: true })
  hepaticImpairment!: string | null;

  // ── EMDEx <-> NDF crosswalk ────────────────────────────────────────────

  /** ATC code resolved via the EMDEx <-> NDF crosswalk. */
  @Column({ name: 'atc_code', type: 'text', nullable: true })
  atcCode!: string | null;

  /** NDF generic code (GN-xxxxx) this EMDEx monograph maps to. */
  @Column({ name: 'ndf_generic_code', type: 'text', nullable: true })
  ndfGenericCode!: string | null;

  /** NDF pharmaceutics code (PN-xxxxx) this EMDEx monograph maps to. */
  @Column({ name: 'ndf_pharmaceutics_code', type: 'text', nullable: true })
  ndfPharmaceuticsCode!: string | null;

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => GenericProductEntity, (gp) => gp.pharmaceutics)
  genericProducts!: GenericProductEntity[];

  @ManyToMany(() => DrugComponentEntity, (dc) => dc.pharmaceutics)
  @JoinTable({
    name: 'pharmaceutics_drug_components',
    joinColumn: { name: 'pharmaceutics_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'drug_component_id', referencedColumnName: 'id' },
  })
  drugComponents!: DrugComponentEntity[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
