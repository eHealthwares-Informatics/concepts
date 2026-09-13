import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PharmaceuticsEntity } from './pharmaceutics.entity';
import { FormulationEntity } from './formulation.entity';
import { DosageFormEntity } from './dosage-form.entity';
import { ManufacturerEntity } from './manufacturer.entity';

/**
 * Generic product entity — represents a specific drug product/formulation.
 *
 * Each product references a PharmaceuticsEntity (monograph) and carries
 * product-level details: dosage form, strength, regulatory status, etc.
 */
@Entity('generic_products')
export class GenericProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (GN-xxxxx from genericDrugs.csv). */
  @Column({ type: 'text' })
  code!: string;

  /** Product name (INN or combination name). */
  @Column({ type: 'text' })
  name!: string;

  /** Therapeutic class (from genericDrugs.csv). */
  @Column({ name: 'therapeutic_class', type: 'text', nullable: true })
  therapeuticClass!: string | null;

  /** Pharmaceutical class (from genericDrugs.csv). */
  @Column({ name: 'pharmaceutical_class', type: 'text', nullable: true })
  pharmaceuticalClass!: string | null;

  /** Dosage form (tablet, injection, syrup, etc.). */
  @Column({ name: 'dosage_form', type: 'text', nullable: true })
  dosageForm!: string | null;

  /** Strength (e.g. "500mg", "250mg/5ml"). */
  @Column({ type: 'text', nullable: true })
  strength!: string | null;

  /** General therapeutic use. */
  @Column({ name: 'general_use', type: 'text', nullable: true })
  generalUse!: string | null;

  /** Adult dosage instructions. */
  @Column({ name: 'adult_dosage', type: 'text', nullable: true })
  adultDosage!: string | null;

  /** Pediatric dosage instructions. */
  @Column({ name: 'pediatric_dosage', type: 'text', nullable: true })
  pediatricDosage!: string | null;

  /** Appendix dosages (special populations, etc.). Stored as JSON. */
  @Column({ name: 'appendix_dosages', type: 'text', nullable: true })
  appendixDosages!: string | null;

  /** EMDEx ATC code reference (from genericDrugs.csv emdexCode). */
  @Column({ name: 'emdex_code', type: 'text', nullable: true })
  emdexCode!: string | null;

  /** ATC code resolved via the EMDEx <-> NDF crosswalk. */
  @Column({ name: 'atc_code', type: 'text', nullable: true })
  atcCode!: string | null;

  /** NDF generic code (GN-xxxxx) this EMDEx product maps to. */
  @Column({ name: 'ndf_generic_code', type: 'text', nullable: true })
  ndfGenericCode!: string | null;

  /** Prescription required flag. */
  @Column({ name: 'is_prescription_required', type: 'boolean', default: false })
  isPrescriptionRequired!: boolean;

  /** Controlled substance flag. */
  @Column({ name: 'is_controlled_substance', type: 'boolean', default: false })
  isControlledSubstance!: boolean;

  // ── Relation to Pharmaceutics (monograph) ──────────────────────────────

  @ManyToOne(() => PharmaceuticsEntity, (p) => p.genericProducts, {
    nullable: false,
  })
  @JoinColumn({ name: 'pharmaceutics_id' })
  pharmaceutics!: PharmaceuticsEntity;

  // ── Relation to Formulation (route/category) ───────────────────────────

  @ManyToOne(() => FormulationEntity, (f) => f.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'formulation_id' })
  formulation!: FormulationEntity | null;

  // ── Relation to DosageForm (physical form) ─────────────────────────────

  @ManyToOne(() => DosageFormEntity, (df) => df.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'dosage_form_id' })
  dosageFormRef!: DosageFormEntity | null;

  // ── Relation to Manufacturer ───────────────────────────────────────────

  @ManyToOne(() => ManufacturerEntity, (m) => m.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer!: ManufacturerEntity | null;

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
